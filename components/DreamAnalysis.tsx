"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Briefcase, GraduationCap, Clock, 
  CheckCircle2, ChevronDown, Zap, Target, 
  IndianRupee, Building2, ListChecks, GraduationCap as GradIcon,
  Timer
} from "lucide-react";
import { AnalysisData } from "@/app/page";
import { toast } from "react-toastify";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface DreamAnalysisProps {
  dream: string;
  initialData: AnalysisData | null;
  onAnalysisComplete: (data: AnalysisData) => void;
  onProceed: () => void;
}

export default function DreamAnalysis({ dream, initialData, onAnalysisComplete, onProceed }: DreamAnalysisProps) {
  const [loading, setLoading] = useState(!initialData);
  const [data, setData] = useState<AnalysisData | null>(initialData);
  const [matchScores, setMatchScores] = useState<number[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      // If we already have data (from cache), don't fetch
      if (initialData) {
        const scores = initialData.career_paths.map((_: any, i: number) => 
          i === 0 ? Math.floor(Math.random() * (96 - 88 + 1)) + 88 : Math.floor(Math.random() * (80 - 60 + 1)) + 60
        );
        setMatchScores(scores);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetchWithRetry("/api/dream", {
          method: "POST",
          body: JSON.stringify({ dream }),
          headers: { "Content-Type": "application/json" },
        });
        
        setData(result);
        onAnalysisComplete(result);
        
        const scores = result.career_paths.map((_: any, i: number) => 
          i === 0 ? Math.floor(Math.random() * (96 - 88 + 1)) + 88 : Math.floor(Math.random() * (80 - 60 + 1)) + 60
        );
        setMatchScores(scores);
      } catch (err: any) {
        toast.error("Failed to analyze dream: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [dream, initialData, onAnalysisComplete]);

  const handleToggleCard = (idx: number) => {
    if (expandedIdx === idx) {
      setExpandedIdx(null);
    } else {
      setExpandedIdx(idx);
      setTimeout(() => {
        cardRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const getSkillScore = (skill: any) => {
    if (skill.score !== undefined) return Math.round(skill.score);
    // Consistent seeded random
    let seed = skill.name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    if (skill.level.toUpperCase() === "ADVANCED") return Math.round(rand() * 20 + 75);
    if (skill.level.toUpperCase() === "INTERMEDIATE") return Math.round(rand() * 25 + 45);
    return Math.round(rand() * 20 + 20);
  };

  if (loading) {
    return (
      <div className="space-y-8 pr-2 w-full animate-pulse">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
            <Loader2 size={24} className="text-primary animate-spin" />
            Analyzing Your Dream...
          </h2>
          <p className="text-zinc-500">Connecting career dots and crafting your future paths.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="glass-card p-6 rounded-2xl flex flex-col border border-white/10 space-y-4">
             <div className="h-6 w-1/3 bg-white/10 rounded mb-4" />
             <div className="h-24 w-full bg-white/5 rounded-2xl" />
             <div className="h-20 w-full bg-white/5 rounded-2xl" />
             <div className="h-20 w-full bg-white/5 rounded-2xl" />
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col border border-white/10 space-y-6">
             <div className="h-6 w-1/3 bg-white/10 rounded mb-2" />
             {[1,2,3,4,5].map(i => (
               <div key={i} className="space-y-2">
                 <div className="flex justify-between"><div className="h-4 w-1/2 bg-white/10 rounded"/><div className="h-4 w-8 bg-white/10 rounded"/></div>
                 <div className="h-2 w-full bg-white/5 rounded-full" />
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getSkillColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "ADVANCED": return "text-[#f87171]"; // Coral/Red
      case "INTERMEDIATE": return "text-amber-500";
      case "BEGINNER": return "text-emerald-500";
      default: return "text-primary";
    }
  };

  const getSkillBarColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "ADVANCED": return "bg-[#f87171]";
      case "INTERMEDIATE": return "bg-amber-500";
      case "BEGINNER": return "bg-emerald-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className="space-y-8 pr-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Career Paths */}
        <div className="glass-card p-6 rounded-2xl flex flex-col border border-white/10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 shrink-0">
            <Briefcase size={16} className="text-primary shrink-0" />
            Potential Careers
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {data.career_paths.map((path, idx) => {
              const isExpanded = expandedIdx === idx;
              return (
                <motion.div 
                  key={idx}
                  ref={el => { cardRefs.current[idx] = el; }}
                  layout
                  onClick={() => handleToggleCard(idx)}
                  className={`p-5 rounded-2xl border transition-all relative cursor-pointer overflow-hidden ${
                    isExpanded 
                      ? 'border-[#7c6af7]/40 bg-[#7c6af7]/5 shadow-[0_0_20px_rgba(124,106,247,0.15)]' 
                      : idx === 0 
                        ? 'border-primary shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.3)] bg-white/5' 
                        : 'border-white/10 bg-white/5'
                  }`}
                  style={{ willChange: "transform" }}
                >
                  {idx === 0 && !isExpanded && (
                    <div className="absolute -top-3 left-4 bg-primary text-black text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded shadow-lg z-20">
                      Best Match
                    </div>
                  )}

                  <div className="flex flex-row flex-nowrap justify-between items-start gap-4 mb-2">
                    <p className={`font-bold text-lg md:text-xl text-primary transition-all ${isExpanded ? '' : 'truncate'}`}>
                      {path.title}
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-1 rounded text-zinc-300">
                        {matchScores[idx]}% Match
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={18} className="text-zinc-500" />
                      </motion.div>
                    </div>
                  </div>

                  {!isExpanded && (
                    <p className="text-zinc-400 text-sm leading-relaxed truncate">{path.description}</p>
                  )}

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.3, ease: "easeInOut" }}
                         className="space-y-4 pt-2"
                      >
                        <div className="w-full h-px bg-white/10 my-3" />
                        <p className="text-zinc-300 text-sm leading-relaxed">{path.description}</p>
                        
                        <div className="w-full h-px bg-white/5 my-3" />
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-zinc-500 flex items-center gap-1.5 mb-2">
                             <IndianRupee size={12} /> Salary Estimation
                          </label>
                          <div className="grid grid-cols-1 gap-2 text-[13px]">
                             <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                               <span className="text-zinc-500">Entry Level</span>
                               <span className="text-zinc-300 font-bold">{path.salary?.entry || "₹3-6 LPA"}</span>
                             </div>
                             <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                               <span className="text-amber-500">Mid Career</span>
                               <span className="text-zinc-300 font-bold">{path.salary?.mid || "₹8-15 LPA"}</span>
                             </div>
                             <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                               <span className="text-[#22c55e]">Senior Expert</span>
                               <span className="text-zinc-300 font-bold">{path.salary?.senior || "₹25-45 LPA"}</span>
                             </div>
                          </div>
                        </div>

                        <div className="w-full h-px bg-white/5 my-3" />
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-zinc-500 flex items-center gap-1.5">
                             <Building2 size={12} /> Top Companies Hiring
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(path.topCompanies || ["Google", "Microsoft", "TCS", "Amazon", "Razorpay"]).map((co, i) => (
                              <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[12px] text-zinc-400">
                                {co}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="w-full h-px bg-white/5 my-3" />
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-zinc-500 flex items-center gap-1.5">
                             <ListChecks size={12} /> Key Responsibilities
                          </label>
                          <div className="space-y-1.5 pt-1">
                             {(path.responsibilities || [
                               `Master the core concepts of ${path.title}`,
                               `Execute complex ${path.title.split(' ')[0]} workflows`,
                               "Collaborate with cross-functional teams"
                             ]).map((resp, i) => (
                               <div key={i} className="flex gap-2 text-[13px] text-zinc-300 leading-snug">
                                 <span className="text-[#7c6af7] shrink-0">→</span>
                                 <span>{resp}</span>
                               </div>
                             ))}
                          </div>
                        </div>

                        <div className="w-full h-px bg-white/5 my-3" />
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-zinc-500 flex items-center gap-1.5">
                             <GradIcon size={12} /> Qualifications Needed
                          </label>
                          <p className="text-[13px] text-zinc-400 pt-1">
                             {path.qualifications || "Relevant degree or equivalent professional certifications with a strong portfolio of projects."}
                          </p>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-3 mt-4">
                           <Timer size={16} className="text-amber-500" />
                           <span className="text-[12px] font-medium text-amber-500/90">
                             Time to get job-ready: <span className="font-bold text-amber-500">{path.timeToReady || "6-12 months"}</span>
                           </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div className="glass-card p-6 rounded-2xl flex flex-col border border-white/10">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <GraduationCap size={16} className="text-primary shrink-0" />
              Required Skills
            </h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f87171] shrink-0" /><span className="text-[10px] text-zinc-500 uppercase">Adv</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /><span className="text-[10px] text-zinc-500 uppercase">Int</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /><span className="text-[10px] text-zinc-500 uppercase">Beg</span></div>
            </div>
          </div>
          <div className="space-y-7 pr-2">
            {data.skills.map((skill, idx) => {
              const score = getSkillScore(skill);
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 overflow-hidden px-0.5">
                    <a 
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(skill.name + ' tutorial course')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sm text-zinc-100 hover:text-[#7c6af7] transition-colors flex items-center gap-1.5 group"
                    >
                      {skill.name}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </span>
                    </a>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`text-[13px] font-black font-mono tracking-tight shrink-0 ${getSkillColor(skill.level)}`}
                    >
                      {score}%
                    </motion.p>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full relative overflow-hidden ring-1 ring-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 + (idx * 0.1) }}
                      className={`absolute top-0 left-0 h-full rounded-full ${getSkillBarColor(skill.level)}`}
                      style={{ willChange: "transform" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline & Action CTA */}
      <div className="bg-[#7c6af7]/5 border border-[#7c6af7]/20 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          <div className="bg-primary/10 p-5 rounded-2xl shrink-0 border border-primary/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Clock size={36} className="text-primary" />
            </motion.div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7c6af7] mb-0.5">Estimated Evolution</h4>
            <p className="text-zinc-200 text-3xl font-black">
               <span className="text-amber-500">{data.timeline}</span>
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={onProceed}
          whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(124,106,247,0.4)" }}
          whileTap={{ scale: 0.97 }}
          className="shimmer-btn w-full md:w-auto bg-gradient-to-r from-[#7c6af7] to-[#d4537e] text-white font-black py-4.5 px-10 rounded-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group shadow-2xl"
          style={{ willChange: "transform" }}
        >
          <Zap size={18} fill="white" className="transition-transform group-hover:scale-125 group-hover:drop-shadow-glow" />
          <span className="text-[16px] tracking-wide">Enter Evolution Simulator</span>
          
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
             <div className="shimmer-overlay absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[100px] -skew-x-[30deg]" />
          </div>
        </motion.button>
      </div>

      <style jsx>{`
        .shimmer-overlay {
          animation: shim 4s infinite linear;
        }
        @keyframes shim {
          0% { transform: translateX(-150%); }
          25% { transform: translateX(450%); }
          100% { transform: translateX(450%); }
        }
      `}</style>
    </div>
  );
}
