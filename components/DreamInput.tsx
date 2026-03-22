"use client";

import { useState } from "react";
import { Send, Rocket, Brain, Zap, Map } from "lucide-react";
import { motion } from "framer-motion";

export default function DreamInput({ onSubmit }: { onSubmit: (dream: string) => void }) {
  const [dream, setDream] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dream.trim()) {
      onSubmit(dream);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      animate={{ 
        borderColor: isFocused ? "rgba(124,106,247,0.5)" : "rgba(255,255,255,0.08)",
        boxShadow: isFocused ? "0 0 0 1px rgba(124,106,247,0.2), inset 0 1px 0 rgba(255,255,255,0.05)" : "none"
      }}
      transition={{ duration: 0.3 }}
      className="glass-card p-8 md:p-12 rounded-[20px] relative z-10"
    >
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Rocket className="text-primary w-6 h-6" />
        Where do you want to be?
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="relative">
          <textarea
            value={dream}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setDream(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (dream.trim()) onSubmit(dream);
              }
            }}
            placeholder="Describe your dream (e.g., I want to become a world-renowned AI artist living in Tokyo...)"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none transition-all min-h-[180px] resize-none placeholder:text-zinc-600 focus:bg-white/[0.08]"
          />
        </div>

        <motion.button
          type="submit"
          disabled={!dream.trim()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="shimmer-btn w-full bg-gradient-to-r from-[#7c6af7] to-[#d4537e] text-white font-semibold py-4.5 px-8 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xl disabled:opacity-50 disabled:scale-100 group"
        >
          <motion.div
            animate={isFocused ? { y: [0, -3, 0] } : {}}
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1 }}
            className="group-hover:animate-bounce"
          >
            <Rocket size={18} />
          </motion.div>
          Simulate My Future
        </motion.button>
      </form>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { step: 1, label: "Analyze Dream", icon: Brain, color: "#7c6af7" },
          { step: 2, label: "Live the Future", icon: Zap, color: "#2dd4bf" },
          { step: 3, label: "Build the Roadmap", icon: Map, color: "#f59e0b" },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)" }}
            className="flex flex-col items-center p-5 bg-white/5 rounded-2xl border border-white/5 transition-colors group cursor-default"
            style={{ borderLeft: `3px solid ${item.color}` }}
          >
            <item.icon size={20} style={{ color: item.color }} className="mb-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <div className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 mb-1">Step {item.step}</div>
            <div className="text-[12px] font-bold text-zinc-300">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
