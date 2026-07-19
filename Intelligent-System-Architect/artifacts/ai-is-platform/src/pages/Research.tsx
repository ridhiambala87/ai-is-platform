import { motion } from "framer-motion";
import { RESEARCH_DIRECTIONS } from "../constants/data";
import { AlertCircle, Target, ShieldCheck, Zap, Lock, Cpu, RefreshCw } from "lucide-react";

export function Research() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Emerging Research Directions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Strategic trajectories for the next 5-10 years of AI integration in Information Systems, based on current capability gaps and theoretical limitations.
          </p>
        </motion.div>

        {/* Timeline container */}
        <div className="relative mb-32 overflow-x-auto pb-8 custom-scrollbar">
          {/* Connecting line */}
          <div className="absolute top-[120px] left-0 right-0 h-1 bg-border/50 min-w-[1200px] z-0" />
          
          <div className="flex gap-8 min-w-[1200px] px-4 relative z-10">
            {RESEARCH_DIRECTIONS.map((dir, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                key={dir.id}
                className="w-[300px] shrink-0"
              >
                <div className="text-sm font-mono text-primary mb-4">{dir.horizon}</div>
                
                {/* Timeline node */}
                <div className="w-8 h-8 rounded-full bg-card border-4 border-background ring-2 ring-primary flex items-center justify-center text-sm mb-6 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  {dir.icon}
                </div>

                <div className="glass-panel rounded-xl p-6 h-[280px] flex flex-col">
                  <h3 className="text-xl font-bold mb-3">{dir.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">
                    {dir.description}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className="text-muted-foreground">Maturity Progress</span>
                      <span className="text-primary">{dir.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${dir.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-3 flex justify-between">
                      <span>Refs: {dir.refs}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Challenges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
            <AlertCircle className="text-destructive w-8 h-8" />
            Key IS Challenges to Overcome
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Scalability O(L²seq·d)", desc: "Quadratic complexity of attention mechanisms limits processing of massive enterprise transaction logs." },
              { icon: Target, title: "Interpretability vs Gain", desc: "Highest performing models remain black boxes; post-hoc XAI adds latency and approximation errors." },
              { icon: Lock, title: "Data Privacy & Silos", desc: "Enterprise data cannot be centralized; federated approaches suffer from communication bottlenecks." },
              { icon: RefreshCw, title: "RL Convergence", desc: "Adaptive autonomous systems struggle to converge in highly stochastic real-world enterprise environments." },
              { icon: Cpu, title: "Computational Overhead", desc: "Energy and hardware costs for continuous retraining of LLMs/GNNs prohibit widespread SME adoption." },
              { icon: ShieldCheck, title: "Algorithmic Governance", desc: "Lack of standardized frameworks for auditing and proving compliance of autonomous IS decisions." }
            ].map((challenge, i) => (
              <div key={i} className="bg-card/50 border border-border/50 rounded-lg p-5 hover:bg-card transition-colors">
                <challenge.icon className="w-6 h-6 text-muted-foreground mb-3" />
                <h4 className="font-semibold mb-2">{challenge.title}</h4>
                <p className="text-sm text-muted-foreground">{challenge.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
