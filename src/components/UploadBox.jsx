import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

const UploadBox = ({ file, onFileChange }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative flex flex-col items-center justify-center w-full max-w-xl mx-auto h-72 border border-white/20 dark:border-white/10 rounded-3xl cursor-pointer bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300 group overflow-hidden"
    >
      {/* Decorative Glow inside */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <input
        type="file"
        accept="application/pdf,.docx"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleChange}
      />

      <div className="flex flex-col items-center p-8 text-center relative z-0">
        {!file ? (
          <>
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="p-4 bg-indigo-50 dark:bg-slate-800 rounded-full mb-4 shadow-inner"
            >
              <UploadCloud className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Drag & Drop Legal Document
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Supports PDF, DOCX
            </p>
          </>
        ) : (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <FileText className="w-16 h-16 text-indigo-500 dark:text-indigo-400 mb-4" />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm"
              >
                 <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </motion.div>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-1 max-w-[250px]">
              {file.name}
            </p>
            <p className="text-sm font-medium text-slate-500 mt-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full shadow-inner">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UploadBox;
