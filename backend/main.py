import os
import fitz
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import AsyncAnthropic
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Import our new FAISS local knowledge base
from rag_engine import rag_engine

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firebase Setup
db = None
try:
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase Admin initialized successfully.")
    else:
        print(f"Firebase Service account missing at {cred_path}. Firebase integration will fail gracefully.")
except Exception as e:
    print(f"Failed to initialize Firebase: {e}")

class APIConfig(BaseModel):
    claude_key: str
    model: str
    tokens: int
    lang: str
    prompts: Dict[str, str]

class DocumentRequest(BaseModel):
    config: APIConfig
    user_id: str
    doc_name: str
    raw_text: str

class RiskRequest(BaseModel):
    config: APIConfig
    user_id: str
    scenario: str

class ChatRequest(BaseModel):
    config: APIConfig
    user_id: str
    analysis_id: Optional[str]
    raw_text: str
    chat_history: List[Dict[str, str]]

class DatasetRequest(BaseModel):
    user_id: str
    source: str
    section: str
    category: str
    language: str
    text: str

def get_claude_client(api_key: str):
    if not api_key:
        raise HTTPException(status_code=400, detail="Claude API key is missing")
    return AsyncAnthropic(api_key=api_key)

@app.get("/")
def health_check():
    return {"status": "ok", "firebase": db is not None, "rag": rag_engine.index is not None}

#########################################################
# MODULE 1: CASE SUMMARIZER
#########################################################

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = ""
        filename = file.filename.lower()
        if filename.endswith(".pdf"):
            doc = fitz.open(stream=content, filetype="pdf")
            for page in doc:
                text += page.get_text() + "\n"
        else:
            text = content.decode("utf-8")
        return {"filename": file.filename, "text": text[:20000]} # Limit to 20k chars for fast LLM
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/document")
async def analyze_document(req: DocumentRequest):
    client = get_claude_client(req.config.claude_key)
    
    sys_prompt = f"""You are an advanced Legal AI Assistant. Analyze the user's document carefully and return the result ONLY as a strictly valid JSON object matching this schema exactly without markdown blocks:
{{
  "summary": "Simple explanation in 5-7 lines",
  "key_points": ["Point 1", "Point 2"],
  "legal_issues": ["Issue 1", "Issue 2"],
  "risk_level": "Low/Medium/High",
  "relevant_laws": ["Law 1"],
  "what_it_means": "Explain impact in plain English"
}}
Output language should be {req.config.lang}."""

    try:
        res = await client.messages.create(
            model=req.config.model,
            max_tokens=req.config.tokens,
            system=sys_prompt,
            messages=[{"role": "user", "content": f"Document Text:\n\n{req.config.raw_text}"}]
        )
        text_out = res.content[0].text
        start = text_out.find("{")
        end = text_out.rfind("}")
        parsed_json = json.loads(text_out[start:end+1]) if start != -1 else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    analysis_id = str(uuid.uuid4())
    if db:
        try:
            db.collection("documentAnalyses").document(analysis_id).set({
                "userId": req.user_id,
                "docName": req.doc_name,
                "analysis": parsed_json,
                "createdAt": datetime.utcnow()
            })
        except Exception as e:
            print("Failed to save to firebase:", e)
            
    return {
        "analysis_id": analysis_id,
        "result": parsed_json
    }

#########################################################
# MODULE 2: RISK ANALYZER
#########################################################

@app.post("/api/analyze/risk")
async def analyze_risk(req: RiskRequest):
    client = get_claude_client(req.config.claude_key)
    
    # 1. FAISS Semantic Search for static laws based on scenario
    static_laws = rag_engine.search(req.scenario, top_k=2)
    law_context = "\n".join([f"- {s['title']} ({s['part']}): {s['text']}" for s in static_laws])

    # 2. LLM Evaluation
    sys_prompt = f"""You are an expert Legal Risk Evaluator. Analyze the user's scenario.
Here is some relevant law context retrieved from our database:
---
{law_context}
---

Return the result ONLY as a strictly valid JSON object matching this schema exactly without markdown blocks:
{{
  "risk_level": "Low/Medium/High",
  "confidence": "eg. 85%",
  "explanation": "Plain-English reasoning",
  "relevant_laws": ["Law 1"],
  "possible_consequences": ["Consequence 1", "Consequence 2"],
  "recommended_actions": ["Action 1", "Action 2"]
}}
Output language should be {req.config.lang}."""

    try:
        res = await client.messages.create(
            model=req.config.model,
            max_tokens=req.config.tokens,
            system=sys_prompt,
            messages=[{"role": "user", "content": f"My Scenario:\n{req.scenario}"}]
        )
        text_out = res.content[0].text
        start = text_out.find("{")
        end = text_out.rfind("}")
        parsed_json = json.loads(text_out[start:end+1]) if start != -1 else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk analysis failed: {e}")
        
    analysis_id = str(uuid.uuid4())
    if db:
        try:
            db.collection("riskAnalyses").document(analysis_id).set({
                "userId": req.user_id,
                "scenario": req.scenario,
                "analysis": parsed_json,
                "createdAt": datetime.utcnow()
            })
        except Exception as e:
            print("Failed to save to firebase:", e)

    return parsed_json

#########################################################
# MODULE 3: RAG CHATBOT
#########################################################

@app.post("/api/chat")
async def chat(req: ChatRequest):
    client = get_claude_client(req.config.claude_key)
    
    # 1. Extract the latest user query
    user_query = req.chat_history[-1]["content"] if req.chat_history else ""
    
    # 2. RAG Retrieval from FAISS Constitution
    rag_docs = rag_engine.search(user_query, top_k=3)
    rag_context = "\n".join([f"Source [{s['doc_id']}]: {s['title']} - {s['text']}" for s in rag_docs])

    # 3. Prompt Engineering
    sys_chat = f"""You are NyayAI, an AI Legal Assistant helping a citizen.
Use plain English. No complex legal jargon. If jargon is used, explain it.
Always cite relevant laws/articles. Ask follow-up questions if unclear.

RETRIEVED LEGAL CONTEXT (from database):
{rag_context if rag_context else "No specific legal statutes retrieved."}

USER'S DOCUMENT CONTEXT (if applicable):
{req.raw_text[:5000]}

Please respond in {req.config.lang}."""

    try:
        reply = await client.messages.create(
            model=req.config.model,
            max_tokens=req.config.tokens,
            system=sys_chat,
            messages=req.chat_history
        )
        content = reply.content[0].text
        citations = [s['doc_id'] for s in rag_docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "reply": content,
        "citations": citations,
        "requires_followup": False
    }

@app.post("/api/chat/save")
async def save_chat_session(req: Request):
    data = await req.json()
    if not db:
        return {"status": "skipped", "reason": "No db"}
    try:
        session_ref = db.collection("chatSessions").document()
        session_ref.set({
            "userId": data.get("user_id"),
            "analysisId": data.get("analysis_id", "none"),
            "language": data.get("language"),
            "messageCount": len(data.get("history", [])),
            "createdAt": datetime.utcnow()
        })
        batch = db.batch()
        for idx, msg in enumerate(data.get("history", [])):
            msg_ref = session_ref.collection("messages").document()
            batch.set(msg_ref, {
                "role": msg.get("role"),
                "content": msg.get("content"),
                "order": idx,
                "timestamp": datetime.utcnow()
            })
        batch.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "saved"}

#########################################################
# DYNAMIC FIREBASE DATASET (Legacy / Custom Uploads)
#########################################################

@app.get("/api/dataset")
async def get_dataset():
    if not db:
        return []
    docs = db.collection("legalDataset").order_by("addedAt", direction=firestore.Query.DESCENDING).limit(20).stream()
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@app.post("/api/dataset")
async def add_dataset(req: DatasetRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    try:
        db.collection("legalDataset").add({
            "source": req.source,
            "section": req.section,
            "category": req.category,
            "language": req.language,
            "text": req.text,
            "charCount": len(req.text),
            "addedBy": req.user_id,
            "addedAt": datetime.utcnow()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "added"}

@app.delete("/api/dataset/{doc_id}")
async def delete_dataset(doc_id: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    try:
        db.collection("legalDataset").document(doc_id).delete()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "deleted"}
