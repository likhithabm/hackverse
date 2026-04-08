import React from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'insights', label: 'Deep Insights' }
  ];

  return (
    <div className="flex justify-center mb-8 relative z-10">
      <div className="inline-flex bg-white/30 dark:bg-slate-900/40 backdrop-blur-lg p-1.5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] border border-white/40 dark:border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-8 py-3 text-sm font-bold rounded-xl transition-colors duration-300 ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-cyan-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
