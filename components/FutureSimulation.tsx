"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

interface Message {
  role: "user" | "assistant";
  content: string;
}

import { fetchWithRetry } from "@/lib/fetchWithRetry";

export default function FutureSimulation({ dream, onComplete }: { dream: string; onComplete: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [xp, setXp] = useState(0);
  const [selectionFeedback, setSelectionFeedback] = useState<{
    text: string;
    outcome: string;
    consequence: string;
    xpChange: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-start simulation
  useEffect(() => {
    if (messages.length === 0) {
      handleChat();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, selectionFeedback]);

  const handleChat = async (userChoice?: string) => {
    setLoading(true);
    setSelectionFeedback(null);
    const updatedHistory = [...messages];
    if (userChoice) {
      updatedHistory.push({ role: "user", content: userChoice });
      setMessages(updatedHistory);
    }

    try {
      const result = await fetchWithRetry("/api/simulation", {
        method: "POST",
        body: JSON.stringify({ dream, history: updatedHistory }),
        headers: { "Content-Type": "application/json" },
      });
      if (result.error) throw new Error(result.error);
      setMessages([...updatedHistory, { role: "assistant", content: result.content }]);
    } catch (err: any) {
      toast.error("Simulation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceClick = (choice: { text: string; outcome: string; consequence: string; xpChange: number }) => {
    if (selectionFeedback) return;
    setSelectionFeedback(choice);
    // Add XP immediately
    setXp(prev => prev + choice.xpChange);
  };

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");
  const round = messages.filter(m => m.role === "assistant").length;

  const character = {
    name: "AI Guide",
    role: "Reality Architect",
    type: "assistant"
  };
  const initials = "AI";

  const choices = lastAssistantMessage
    ? extractChoices(lastAssistantMessage.content)
    : [];

  return (
    <div className="flex flex-col h-[650px] glass-card rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
      {/* Scanning effect bar */}
      <motion.div 
        animate={{ translateY: [0, 650, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-10 pointer-events-none opacity-50"
      />

      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 py-4 px-8 flex items-center justify-between backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Sparkles className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Future Reality Simulator</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Temporal Sync: Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Rank XP</span>
            <span className="text-sm font-bold text-primary font-mono">{xp}</span>
          </div>
          <button
            onClick={onComplete}
            className="bg-white/5 hover:bg-white/10 text-white font-bold py-2 px-6 rounded-xl text-xs transition-all border border-white/10 hover:border-white/20 uppercase tracking-widest"
          >
            Finish Simulation
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Background Orbs */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* LEFT — Scenario */}
        <div className="w-full md:w-[58%] flex flex-col p-8 border-r border-white/5 bg-black/20">
          
          {/* Character header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/40 rounded-full blur-md" />
                <div className={`avatar ${character.type} relative w-12 h-12 rounded-full bg-zinc-900 border-2 border-primary/50 flex items-center justify-center text-primary font-bold text-sm shadow-xl`}>
                  {initials}
                </div>
              </div>
              <div>
                <div className="font-bold text-white text-base tracking-tight">
                  {character.name}
                </div>
                <div className="text-primary/70 text-xs font-medium">
                  {character.role}
                </div>
              </div>
            </div>
            <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg text-[10px] font-black text-primary uppercase tracking-widest">
              Round {round}
            </div>
          </div>

          {/* Full scenario text container with independent scroll */}
          <div className="flex-1 overflow-hidden px-1">
            <div className="h-full bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 relative group shadow-2xl overflow-hidden flex flex-col">
              {/* Visual accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 blur-[40px] pointer-events-none" />
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-[32px]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-[32px]" />
              
              {loading && !lastAssistantMessage ? (
                 <div className="flex flex-col gap-6 h-full justify-center items-center opacity-50">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">De-compressing Narrative...</span>
                 </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Scenario Stream // 01</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">N-SYNC</span>
                         <div className="w-8 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 2 }} className="w-full h-full bg-primary" />
                         </div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar text-[17px] text-white/90 leading-[2] tracking-normal font-medium selection:bg-primary/30">
                    {lastAssistantMessage ? formatScenarioText(cleanAssistantContent(lastAssistantMessage.content)) : "Connecting to temporal nexus..."}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-30">
                     <div className="flex gap-4 text-[9px] font-mono tracking-tighter uppercase">
                        <span>ID: NEX-772</span>
                        <span>STABILITY: OPTIMAL</span>
                     </div>
                     <span className="text-[9px] font-mono tracking-tighter uppercase">CHRONON // {new Date().toLocaleTimeString()}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Choices & Input */}
        <div className="w-full md:w-[42%] flex flex-col p-8 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto custom-scrollbar">
          
          <div className="mb-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2 pl-1 italic">
              Awaiting Directive
            </h4>
            <div className="h-[1px] w-full bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {loading && !selectionFeedback ? (
               <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-white/[0.02] border border-white/05 rounded-2xl animate-pulse" />
                 ))}
               </div>
            ) : (
              <div className="flex flex-col gap-3">
                {choices.map((choice, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChoiceClick(choice)}
                    disabled={!!selectionFeedback}
                    className="w-full text-left p-5 rounded-2xl min-h-[72px] items-start
                      bg-white/[0.03] border border-white/10
                      hover:bg-primary/10 hover:border-primary/40
                      transition-all duration-300 group relative
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[12px] font-black text-primary flex-shrink-0 mt-0.5 group-hover:border-primary/50 transition-colors">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-[14px] text-zinc-300 leading-[1.6] group-hover:text-white transition-colors py-1">
                        {choice.text}
                      </span>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={18} className="text-primary" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Outcome feedback */}
            <AnimatePresence>
              {selectionFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`mt-4 p-6 rounded-2xl border backdrop-blur-md shadow-lg
                    ${selectionFeedback.outcome.toLowerCase() === 'good' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' 
                      : selectionFeedback.outcome.toLowerCase() === 'bad'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-100'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      selectionFeedback.outcome.toLowerCase() === 'good' ? 'bg-emerald-400' :
                      selectionFeedback.outcome.toLowerCase() === 'bad' ? 'bg-rose-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-70">
                      Outcome Registered
                    </span>
                  </div>
                  <p className="text-[14px] leading-relaxed italic">
                    "{selectionFeedback.consequence}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next scenario button */}
            {selectionFeedback && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChat(selectionFeedback.text)}
                className="w-full mt-4 py-4 px-8 bg-gradient-to-r from-primary to-accent text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
              >
                Proceed to Next Chronon <ChevronRight size={16} />
              </motion.button>
            )}

            {/* Manual Input (Fallback) */}
            {!loading && choices.length === 0 && lastAssistantMessage && !selectionFeedback && (
              <div className="mt-auto pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase text-zinc-600 mb-3 tracking-widest pl-1">Quantum Input Interface</p>
                <div className="relative group">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChat(input)}
                    placeholder="Enter choice manually..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm text-white placeholder:text-zinc-700"
                  />
                  <button
                    onClick={() => handleChat(input)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover p-2 rounded-xl text-white transition-all shadow-lg"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatScenarioText(text: string) {
  // Support basic markdown like **text**
  const paragraphs = text.split("\n\n").filter(p => p.trim() !== "");
  
  return paragraphs.map((paragraph, pIdx) => (
    <p key={pIdx} className="mb-4 last:mb-0">
      {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              {part.substring(2, part.length - 2)}
            </strong>
          );
        }
        return part;
      })}
    </p>
  ));
}

// Helpers to extract choices from assistant text with the new format (Choice [OUTCOME: ...])
function extractChoices(text: string): { 
  text: string; 
  outcome: string; 
  consequence: string; 
  xpChange: number; 
}[] {
  const lines = text.split("\n").filter(l => l.trim().startsWith("-"));
  
  return lines.map(line => {
    const textMatch = line.match(/^-\s(.*?)\s\[/);
    const outcomeMatch = line.match(/OUTCOME:\s(.*?)\s\|/);
    const consequenceMatch = line.match(/CONSEQUENCE:\s(.*?)\s\|/);
    const xpMatch = line.match(/XP:\s([+-]?\d+)\]/);

    return {
      text: textMatch ? textMatch[1].trim() : line.replace(/^-\s/, "").split("[")[0].trim(),
      outcome: outcomeMatch ? outcomeMatch[1].trim() : "Neutral",
      consequence: consequenceMatch ? consequenceMatch[1].trim() : "You continue your journey.",
      xpChange: xpMatch ? parseInt(xpMatch[1]) : 5
    };
  });
}

function cleanAssistantContent(text: string): string {
  // Remove the choices and their metadata from the main bubble
  const parts = text.split("\n-");
  return parts[0].trim();
}
