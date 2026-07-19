import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Cpu, Brain, RefreshCw, X, ArrowRight } from "lucide-react";
import { ARCHITECTURE_MODULES } from "../constants/data";

const icons = {
  database: Database,
  cpu: Cpu,
  brain: Brain,
  "refresh-cw": RefreshCw
};

export function Architecture() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const activeData = activeModule ? ARCHITECTURE_MODULES.find(m => m.id === activeModule) : null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4">AI-IS Pipeline Architecture</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive four-module pipeline illustrating data flow, intelligent processing, decision generation, and adaptive feedback in enterprise environments.
        </p>
      </motion.div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 items-start relative">
        {/* Pipeline Diagram */}
        <div className="flex-1 w-full lg:w-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Animated Connecting Lines (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-[12%] right-[12%] h-[2px] -translate-y-1/2 z-0">
            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
              <line 
                x1="0" y1="0" x2="100%" y2="0" 
                stroke="currentColor" 
                strokeWidth="2"
                className="text-border"
                strokeDasharray="4 4"
              />
              <line 
                x1="0" y1="0" x2="100%" y2="0" 
                stroke="var(--color-primary)" 
                strokeWidth="2"
                strokeDasharray="12 12"
                className="animate-flow opacity-50"
              />
            </svg>
          </div>

          {ARCHITECTURE_MODULES.map((mod, i) => {
            const Icon = icons[mod.icon as keyof typeof icons];
            const isActive = activeModule === mod.id;
            
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveModule(isActive ? null : mod.id)}
                className={`
                  relative z-10 glass-panel rounded-xl p-6 cursor-pointer transition-all duration-300
                  ${isActive ? 'ring-2 ring-primary scale-105 bg-card/80' : 'hover:border-primary/50 hover:bg-card/40'}
                `}
                style={{
                  boxShadow: isActive ? `0 0 30px ${mod.color}30` : 'none',
                  borderColor: isActive ? mod.color : undefined
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: `${mod.color}20`, color: mod.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{mod.name}</h3>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-4">
                  Module {mod.position}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {mod.components.slice(0, 3).map((comp, j) => (
                    <span key={j} className="text-xs px-2 py-1 bg-background/50 rounded border border-border/30">
                      {comp}
                    </span>
                  ))}
                  {mod.components.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-background/50 rounded border border-border/30">
                      +{mod.components.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="mt-4 flex items-center text-sm font-medium" style={{ color: mod.color }}>
                  View details <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Side Panel for Details */}
        <AnimatePresence>
          {activeData && (
            <motion.div
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "100%", maxWidth: "400px" }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              className="w-full lg:w-[400px] shrink-0"
            >
              <div className="glass-panel rounded-2xl p-6 h-full border-t-4" style={{ borderTopColor: activeData.color }}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-sm font-mono text-muted-foreground mb-1">MODULE {activeData.position}</div>
                    <h2 className="text-2xl font-bold text-foreground">{activeData.name}</h2>
                  </div>
                  <button 
                    onClick={() => setActiveModule(null)}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${activeData.color}20`, color: activeData.color }}>
                  {(() => {
                    const Icon = icons[activeData.icon as keyof typeof icons];
                    return <Icon className="w-8 h-8" />;
                  })()}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  {activeData.description}
                </p>

                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-foreground/80">Key Components</h4>
                  <ul className="space-y-3">
                    {activeData.components.map((comp, idx) => (
                      <motion.li 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (idx * 0.05) }}
                        key={idx} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeData.color }} />
                        <span className="text-sm font-medium">{comp}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
