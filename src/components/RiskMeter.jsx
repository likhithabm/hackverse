import React from 'react';
import { motion } from 'framer-motion';

const RiskMeter = ({ level }) => {
  const normalizedLevel = level?.toLowerCase() || 'low';
  
  const getConfig = () => {
    switch (normalizedLevel) {
      case 'low':
        return { percent: 18, color: 'bg-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]', label: 'LOW', textColor: 'text-emerald-500' };
      case 'medium':
        return { percent: 62, color: 'bg-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]', label: 'MEDIUM', textColor: 'text-amber-500' };
      case 'high':
        return { percent: 94, color: 'bg-rose-500', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.5)]', label: 'HIGH', textColor: 'text-rose-500' };
      default:
        return { percent: 0, color: 'bg-slate-300', glow: '', label: 'UNKNOWN', textColor: 'text-slate-500' };
    }
  };

  const { percent, color, glow, label, textColor } = getConfig();

  return (
    <div className="w-full py-4 relative">
      <div className="flex justify-between items-end mb-3">
        <span className="text-sm font-bold tracking-wide text-slate-600 dark:text-slate-400 uppercase">Risk Assessment</span>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-black tracking-widest ${textColor} uppercase`}>{label}</span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-2 py-1 rounded-md shadow-inner">
            {percent}%
          </span>
        </div>
      </div>
      
      {/* Background Track */}
      <div className="h-4 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner relative backdrop-blur-sm">
        {/* Animated Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full ${color} rounded-full ${glow} relative`}
        >
          {/* Internal Shimmer */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>

      {/* Axis markers */}
      <div className="flex justify-between w-full mt-2 px-1">
        <span className="text-[10px] font-bold text-slate-400">0%</span>
        <span className="text-[10px] font-bold text-slate-400">50%</span>
        <span className="text-[10px] font-bold text-slate-400">100%</span>
      </div>
    </div>
  );
};

export default RiskMeter;
