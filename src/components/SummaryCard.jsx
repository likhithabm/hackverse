import React from 'react';
import { FileText, ShieldCheck, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryCard = ({ summary }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] transition-all hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)] group"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400"></div>
      
      {/* Decorative Blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 duration-700"></div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-cyan-400 shadow-inner">
            <FileText size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Executive Summary</h3>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full shadow-sm text-emerald-700 dark:text-emerald-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold tracking-wide">CONFIDENCE: 98%</span>
        </div>
      </div>
      
      <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-base md:text-lg mb-8 relative z-10 font-medium">
        {summary ? (
          <p className="whitespace-pre-wrap">{summary}</p>
        ) : (
          <p className="italic text-slate-400">No summary available.</p>
        )}
      </div>

      <div className="flex justify-end border-t border-slate-200/50 dark:border-slate-800 pt-6">
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-colors backdrop-blur-sm group/btn"
        >
          <Download size={16} className="text-indigo-500 group-hover/btn:text-indigo-600 dark:text-cyan-400" />
          Download Full Report
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
