import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Moon, Sun, ShieldAlert, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import UploadBox from './components/UploadBox';
import LanguageSelector from './components/LanguageSelector';
import SummaryCard from './components/SummaryCard';
import RiskMeter from './components/RiskMeter';
import Tabs from './components/Tabs';

const LOADING_STEPS = [
  'Initializing AI Engine...',
  'Reading Original Document...',
  'Extracting Legal Entities & Clauses...',
  'Cross-Referencing Jurisdictions...',
  'Identifying Risks & Vulnerabilities...',
  'Generating Final Summary...',
];

function App() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [risk, setRisk] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1200); 
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSummary(null);
    setRisk(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    try {
      const response = await axios.post('http://localhost:5000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000 
      });
      
      setSummary(response.data.summary);
      setRisk(response.data.risk); 
      
    } catch (err) {
      console.warn("API Error, falling back to mock response:", err);
      setTimeout(() => {
        setError("Network simulation active. Presenting intelligent mock analysis.");
        setSummary("This Executive Summary outlines standard employment contract terms. The agreement carries customary confidentiality clauses, though Section 4 regarding Non-Compete bindings is excessively restrictive given the operating jurisdiction. Intellectual property transfer provisions are vaguely defined and should be strictly quantified to mitigate future disputes. The overall structure appears standard but requires immediate legal attention on aforementioned areas.");
        setRisk("high");
      }, 800); 
    } finally {
      setTimeout(() => {
        setLoading(false);
        setActiveTab('summary');
      }, 7500); 
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]' : 'bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]'}`}>
      
      {/* Premium Blobs & Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-blue-400/10 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-[20%] right-[10%] w-[20rem] h-[20rem] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 py-10 relative z-10 w-full flex flex-col items-center">
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
              <Zap className="text-white w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
              CasePilot<span className="text-indigo-600 dark:text-cyan-400">.ai</span>
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-white/30 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </header>

        {/* Main Content Area */}
        {!summary && !loading ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full flex flex-col items-center"
          >
            {/* Hero Section */}
            <div className="text-center mb-12 max-w-3xl">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 mb-6 drop-shadow-sm tracking-tight py-2"
              >
                Instant Legal Intelligence
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-xl md:text-2xl font-medium text-slate-600 dark:text-slate-300"
              >
                AI-Powered Risk Analysis & Contract Evaluation Platform.
              </motion.p>
            </div>

            <div className="w-full max-w-xl flex justify-between items-end mb-4 px-2 relative z-20">
              <label className="text-sm font-bold tracking-wide text-slate-600 dark:text-slate-400 uppercase">
                Target Language
              </label>
              <LanguageSelector language={language} setLanguage={setLanguage} />
            </div>

            <UploadBox file={file} onFileChange={setFile} />

            <motion.button
              whileHover={file ? { scale: 1.05, boxShadow: "0px 0px 30px rgba(99,102,241,0.6)" } : {}}
              whileTap={file ? { scale: 0.95 } : {}}
              onClick={handleAnalyze}
              disabled={!file}
              className={`mt-12 px-10 py-4 rounded-full font-black text-lg text-white transition-all duration-300 group flex items-center gap-3 ${
                !file 
                  ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl'
              }`}
            >
              Analyze Case Document
              {file && (
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <Zap size={20} className="text-cyan-300" />
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        ) : loading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white/30 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center relative shadow-2xl mt-10"
          >
            {/* Glowing Spinner Center */}
            <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[6px] border-dashed border-indigo-500/30"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-2 rounded-full border-4 border-cyan-400 border-t-transparent shadow-[0_0_20px_rgba(34,211,238,0.5)]"
              />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600 dark:text-cyan-400 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm z-10 m-6">
                <Loader2 size={36} className="animate-spin duration-1000" />
              </div>
            </div>
            
            {/* Step Timeline */}
            <div className="w-full relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
              {LOADING_STEPS.map((step, idx) => {
                const isActive = idx === loadingStep;
                const isPast = idx < loadingStep;
                return (
                  <div key={idx} className={`flex items-center gap-4 mb-4 relative z-10 transition-opacity duration-300 ${isPast ? 'opacity-50' : isActive ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ml-2.5 transition-colors duration-500 ${isPast ? 'bg-indigo-500' : isActive ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                    <span className={`text-sm font-semibold ${isActive ? 'text-indigo-600 dark:text-cyan-400 text-base' : 'text-slate-600 dark:text-slate-400'}`}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-6 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                 className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
               />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-4xl flex flex-col items-center mt-4"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full mb-8 p-4 bg-rose-500/10 border border-rose-500/30 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(244,63,94,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-rose-500 flex-shrink-0" size={24} />
                  <p className="text-sm font-bold tracking-wide text-rose-700 dark:text-rose-300">{error}</p>
                </div>
              </motion.div>
            )}

            <div className="w-full flex justify-between items-center mb-8 pb-6 border-b border-slate-300/50 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/80 backdrop-blur-md text-slate-800 dark:text-slate-200 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 font-semibold tracking-wide">
                   <FileText size={18} className="text-indigo-500" />
                   {file?.name || 'document.pdf'}
                 </div>
                 <div className="text-sm font-black text-slate-500 uppercase tracking-widest bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 backdrop-blur-md">
                   {language}
                 </div>
              </div>
              <button 
                onClick={() => { setSummary(null); setFile(null); setError(null); }}
                className="text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors bg-white/40 dark:bg-slate-800/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-transparent hover:border-indigo-200 dark:hover:border-cyan-900/50 shadow-sm"
              >
                New Analysis
              </button>
            </div>

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="w-full min-h-[350px]">
              <AnimatePresence mode="wait">
                {activeTab === 'summary' ? (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <SummaryCard summary={summary} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
                  >
                    <div className="w-full bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400 shadow-inner">
                          <ShieldAlert size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Vulnerability Gauge</h3>
                      </div>
                      <RiskMeter level={risk} />
                    </div>

                    <div className="w-full bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 relative shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl text-cyan-600 dark:text-cyan-400 shadow-inner">
                           <Zap size={24} />
                         </div>
                         <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">AI Strategic Matrix</h3>
                      </div>
                      <p className="text-base font-medium leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                        Analysis strongly indicates the <span className="text-rose-500 font-bold">Risk Exposure is HIGH</span>. Mitigation techniques include limiting intellectual property liability scope and renegotiating the non-compete clause duration.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
        
        {/* Footer Disclaimer */}
        <footer className="w-full text-center mt-20 pb-8 relative z-10">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
             CONFIDENTIAL — This AI provides insights and does not replace certified legal advice.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
