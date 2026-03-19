import React from 'react';
import { Incident } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertTriangle, Zap, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IncidentCardProps {
  incident: Incident;
  isSelected: boolean;
  onClick: () => void;
}

export default function IncidentCard({ incident, isSelected, onClick }: IncidentCardProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden",
        isSelected 
          ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
          : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            incident.type === 'Conflict' ? "bg-red-500" : 
            incident.type === 'Military' ? "bg-blue-500" : 
            incident.type === 'Protest' ? "bg-orange-500" : 
            "bg-emerald-500"
          )} />
          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">
            {incident.type} // {incident.source}
          </span>
        </div>
        <span className={cn(
          "text-[8px] font-mono font-bold",
          incident.severity > 70 ? "text-red-500" : "text-emerald-500"
        )}>
          SVR_{incident.severity}
        </span>
      </div>

      <h4 className="text-xs font-bold text-zinc-100 leading-snug mb-2 group-hover:text-white transition-colors">
        {incident.title}
      </h4>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[8px] text-zinc-500 font-mono">
          <Clock className="w-2.5 h-2.5" />
          {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true }).toUpperCase()}
        </div>
        {incident.escalationRisk === 'High' && (
          <div className="flex items-center gap-1 text-[8px] font-bold text-red-500 uppercase animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5" />
            Escalation
          </div>
        )}
      </div>

      {isSelected && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"
        />
      )}
    </button>
  );
}
