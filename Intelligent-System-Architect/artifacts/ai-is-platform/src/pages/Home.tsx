import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Brain, Cpu, Database, RefreshCw, Zap } from "lucide-react";
import { AI_TECHNIQUES } from "../constants/data";

function Counter({ target, duration = 2000, suffix = "" }: { target: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const update = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(ease * target));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(update);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <span className="font-mono">{count}{suffix}</span>;
}

export function Home() {
  return (
    <div className="min-h-screen pt-16 flex flex-col items-center relative overflow-hidden">
      {/* Abstract Background Particles (CSS simulated) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-30">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] mix-blend-screen absolute -bottom-20 -right-20" />
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
          IEEE Accepted Research
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl leading-tight"
        >
          AI Applications in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-electric">
            Information Systems
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 font-light"
        >
          Architectures, Techniques, and Emerging Research Directions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mb-16 text-sm text-muted-foreground"
        >
          {["T. Rajitha Madhu Priya", "Ramya M", "Md Ankushavali", "Ridhi Jain"].map((author, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>{author}</span>
            </div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-24"
        >
          <Link href="/architecture" className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            Explore Architecture
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/techniques" className="flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-all">
            Browse AI Techniques
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-6xl mb-24"
        >
          {[
            { label: "AI Techniques", value: 15, icon: <Brain className="w-5 h-5 text-primary" /> },
            { label: "Architecture Modules", value: 4, icon: <Database className="w-5 h-5 text-accent" /> },
            { label: "Best Gain (Hybrid)", value: 30, suffix: "%", icon: <Zap className="w-5 h-5 text-[#10B981]" /> },
            { label: "Math Formulas", value: 15, icon: <Cpu className="w-5 h-5 text-[#C026D3]" /> },
            { label: "Future Directions", value: 5, icon: <RefreshCw className="w-5 h-5 text-electric" /> },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors">
              <div className="mb-3 p-3 rounded-full bg-background/50 border border-border/50 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Abstract Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full max-w-4xl glass-panel rounded-2xl p-8 md:p-12 text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            Abstract
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg font-light">
            This platform presents an interactive exploration of the role of Artificial Intelligence within Information Systems (IS). It categorizes AI applications across IS architectures, analyzes 15 key AI techniques and their performance gains, provides rigorous mathematical foundations, and outlines emerging research trajectories. 
          </p>
        </motion.div>

      </div>

      {/* Technique Preview Strip */}
      <div className="w-full overflow-hidden py-12 border-t border-border/50 bg-background z-10 relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex w-max animate-[marquee_40s_linear_infinite]">
          {[...AI_TECHNIQUES, ...AI_TECHNIQUES].map((tech, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3 mx-4 rounded-full border border-border/50 bg-card whitespace-nowrap">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.color }} />
              <span className="font-medium text-sm">{tech.paradigm}</span>
              <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                {tech.layer}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
