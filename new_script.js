/**
 * APP STATE & CONFIG
 */
const API_BASE = 'http://localhost:8000/api';
const APP = {
  keys: { claude: '' },
  config: { model: 'claude-sonnet-4-20250514', tokens: 2048, lang: 'English', prompts: {} },
  data: { 
    userId: 'user_' + Math.random().toString(36).substr(2, 9), 
    docName: '', rawText: '', 
    analysisId: null, chatHistory: [] 
  }
};

/**
 * UI UTILS
 */
function $(id) { return document.getElementById(id); }
function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${msg}`;
  $('toast-container').appendChild(t);
  setTimeout(() => { t.style.animation = 'fadeOutInfo 0.3s forwards'; setTimeout(() => t.remove(), 300); }, 3000);
}
function setLoader(id, loading) {
  const btn = $(id);
  if (!btn) return;
  if(loading) { btn.classList.add('loading'); btn.disabled = true; }
  else { btn.classList.remove('loading'); btn.disabled = false; }
}

/**
 * INIT & NAVIGATION
 */
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const target = e.currentTarget.getAttribute('data-target');
    $(target).classList.add('active');
    if (window.innerWidth <= 768) $('sidebar').classList.remove('open');
    if (target === 'dataset-panel') loadDataset();
  });
});

$('mobile-menu-btn').addEventListener('click', () => {
  $('sidebar').classList.toggle('open');
});

/**
 * SAVE CONFIG & TEST CONNECTIONS
 */
$('btn-save-config').addEventListener('click', () => {
  APP.keys.claude = $('claude-key').value.trim();
  APP.config.model = $('claude-model').value;
  APP.config.tokens = parseInt($('claude-tokens').value);
  APP.config.lang = $('app-language').value;
  
  const dot = $('global-status-dot');
  const txt = $('global-status-text');
  
  if (APP.keys.claude.length > 0) { dot.style.background = 'var(--success)'; txt.innerText = 'Ready (API configured)'; }
  else { dot.style.background = 'var(--danger)'; txt.innerText = 'Not configured'; }
  
  showToast('Configuration saved', 'success');
});

$('btn-test-connections').addEventListener('click', async () => {
  setLoader('btn-test-connections', true);
  try {
    const res = await fetch(`http://localhost:8000/`);
    const data = await res.json();
    $('status-fb').innerText = `DB: ${data.firebase ? '✅' : '⚠️'} | RAG: ${data.rag ? '✅' : '⚠️'}`;
  } catch (e) {
    $('status-fb').innerText = 'Backend Disconnected ❌';
  }
  setLoader('btn-test-connections', false);
});

/**
 * FILE UPLOAD
 */
const dropzone = $('dropzone');
const fileInput = $('file-input');

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover');});
dropzone.addEventListener('dragleave', e => { e.preventDefault(); dropzone.classList.remove('dragover');});
dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); });
fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

async function handleFile(file) {
  if (!file) return;
  APP.data.docName = file.name;
  $('file-name-display').innerText = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    APP.data.rawText = data.text;
    
    $('extracted-text').value = APP.data.rawText.substring(0, 1200) + "...";
    $('upload-preview').style.display = 'block';
    showToast('File extracted successfully', 'success');
  } catch (e) { showToast('Error parsing file: ' + e.message, 'error'); }
}

/**
 * ANALYSIS (CASE SUMMARIZER)
 */
$('btn-run-analysis').addEventListener('click', async () => {
  if(!APP.keys.claude) return showToast("Configure Claude API key first", "error");
  setLoader('btn-run-analysis', true);
  
  try {
    document.querySelectorAll('.nav-item')[2].click(); // Go to Analysis panel
    $('analysis-empty').style.display = 'none';
    $('analysis-content').style.display = 'block';
    
    const payload = {
        config: { claude_key: APP.keys.claude, model: APP.config.model, tokens: APP.config.tokens, lang: APP.config.lang, prompts: {} },
        user_id: APP.data.userId, doc_name: APP.data.docName, raw_text: APP.data.rawText
    };

    const res = await fetch(`${API_BASE}/analyze/document`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    
    APP.data.analysisId = data.analysis_id;
    const r = data.result;
    
    $('doc-summary').innerHTML = `
      <p><b>Summary:</b> ${r.summary || 'N/A'}</p>
      <p><b>Key Points:</b> <ul>${(r.key_points || []).map(p => `<li>${p}</li>`).join('')}</ul></p>
      <div style="padding:10px; background:var(--surface-hover); border-radius:4px;"><b>Plain English Translation:</b> ${r.what_it_means || 'N/A'}</div>
    `;
    
    const pill = $('risk-pill');
    pill.className = `pill ${r.risk_level || 'UNKNOWN'}`;
    pill.innerText = `${r.risk_level || 'UNKNOWN'} RISK`;
    $('risk-score').innerText = 'N/A';
    
    $('risk-reasons').innerHTML = (r.legal_issues || []).map(i => `<li>${i}</li>`).join('');
    $('legal-sections').innerHTML = (r.relevant_laws || []).map(s => `<span class="pill neutral">${s}</span>`).join('');
    $('immediate-actions').innerHTML = 'Run the Risk Analyzer tab for precise action steps.';
    
    showToast("Case Summary Complete", 'success');
  } catch (e) {
    showToast('Analysis Error: ' + e.message, 'error');
  }
  setLoader('btn-run-analysis', false);
});

$('btn-save-analysis').addEventListener('click', () => { showToast("Backend automatically saves reports.", "info"); });

/**
 * CHAT (RAG BOT)
 */
function appendMessage(role, content, citations = []) {
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;
  div.innerHTML = content.replace(/\n/g, '<br>');
  if (citations && citations.length > 0) {
      div.innerHTML += `<div style="margin-top:10px; font-size:11px; color:#888;"><b>Sources:</b> ${citations.join(', ')}</div>`;
  }
  $('chat-history').appendChild(div);
  $('chat-history').scrollTop = $('chat-history').scrollHeight;
  if(role !== 'system') APP.data.chatHistory.push({role, content});
}

async function sendChatMessage() {
  const input = $('chat-input');
  const text = input.value.trim();
  if(!text) return;
  if(!APP.keys.claude) return showToast("Configure Claude API first", "error");

  input.value = '';
  appendMessage('user', text);
  
  try {
    $('btn-send-chat').disabled = true; $('btn-send-chat').innerText = '...';
    
    const payload = {
        config: { claude_key: APP.keys.claude, model: APP.config.model, tokens: APP.config.tokens, lang: APP.config.lang, prompts: {} },
        user_id: APP.data.userId, analysis_id: APP.data.analysisId,
        raw_text: APP.data.rawText, chat_history: APP.data.chatHistory
    };
    
    const res = await fetch(`${API_BASE}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    appendMessage('assistant', data.reply, data.citations);
  } catch(e) {
    showToast("Chat Error: " + e.message, "error");
    APP.data.chatHistory.pop();
  } finally {
    $('btn-send-chat').disabled = false; $('btn-send-chat').innerText = 'Send';
  }
}

function sendQuickMessage(text) { $('chat-input').value = text; sendChatMessage(); }

$('btn-clear-chat').addEventListener('click', () => {
  $('chat-history').innerHTML = '<div class="chat-bubble assistant">Hello! I am NyayAI, powered by RAG FAISS. Ask me anything about Indian Law!</div>';
  APP.data.chatHistory = [];
});

$('btn-save-chat').addEventListener('click', () => { showToast("Chat saving implemented on server side", "success"); });

/**
 * DATASET (Legacy / Manual Uploads)
 */
async function loadDataset() {
  const tbody = $('dataset-tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  try {
    const res = await fetch(`${API_BASE}/dataset`);
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    if(data.length === 0) { tbody.innerHTML = '<tr><td colspan="4">No entries found</td></tr>'; return; }
    
    let html = '';
    data.forEach(d => {
      html += `<tr><td>${d.source}</td><td>${d.section}</td><td><span class="pill neutral">${d.category}</span></td>
      <td><button class="btn btn-secondary" style="padding:4px 8px; font-size:12px; color:var(--danger)" onclick="deleteDataset('${d.id}')">Delete</button></td></tr>`;
    });
    tbody.innerHTML = html;
  } catch(e) { tbody.innerHTML = '<tr><td colspan="4" style="color:var(--danger)">Error loading data</td></tr>'; }
}

window.deleteDataset = async function(id) {
    if(!confirm("Delete this entry?")) return;
    try { 
        await fetch(`${API_BASE}/dataset/${id}`, { method: 'DELETE' });
        showToast("Deleted", "success"); loadDataset(); 
    } catch(e) { showToast("Delete error: "+e.message, "error"); }
};
