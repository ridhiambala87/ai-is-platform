import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Activity, Layers, Star, X } from "lucide-react";
import { AI_TECHNIQUES } from "../constants/data";

const CATEGORIES = ["All", "Supervised", "Deep Learning", "Ensemble", "Adaptive", "Graph", "Symbolic", "Distributed", "Hybrid", "Governance"];

export function Techniques() {
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"Name" | "Gain" | "Maturity">("Gain");
  const [selectedTech, setSelectedTech] = useState<typeof AI_TECHNIQUES[0] | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = filter === "All" ? AI_TECHNIQUES : AI_TECHNIQUES.filter(t => t.category === filter);
    
    return result.sort((a, b) => {
      if (sortBy === "Name") return a.paradigm.localeCompare(b.paradigm);
      if (sortBy === "Gain") return b.gain - a.gain;
      if (sortBy === "Maturity") {
        const order = { "Mature": 1, "Advanced": 2, "Emerging": 3 };
        return order[a.maturity as keyof typeof order] - order[b.maturity as keyof typeof order];
      }
      return 0;
    });
  }, [filter, sortBy]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Techniques Explorer</h1>
          <p className="text-muted-foreground">Detailed catalog of 15 key AI paradigms applied to Information Systems.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm bg-card border border-border rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Sort by:</span>
            <select 
              className="bg-transparent text-foreground font-medium outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="Gain">Performance Gain</option>
              <option value="Name">Name (A-Z)</option>
              <option value="Maturity">Maturity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === cat 
                ? 'bg-primary text-white border-transparent' 
                : 'bg-background border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAndSorted.map(tech => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5, scale: 1.02 }}
              key={tech.id}
              onClick={() => setSelectedTech(tech)}
              className="glass-panel rounded-xl overflow-hidden cursor-pointer flex flex-col h-full border-t-2 transition-shadow"
              style={{ 
                borderTopColor: tech.color,
              }}
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-background/50 border border-border/50 text-muted-foreground">
                    {tech.category}
                  </span>
                  <div className="flex items-center gap-1 text-[#10B981] font-mono text-sm bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/20">
                    <Activity className="w-3 h-3" />
                    +{tech.gain}%
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-foreground">{tech.paradigm}</h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-mono">
                  <Layers className="w-4 h-4" style={{ color: tech.color }} />
                  {tech.layer}
                </div>
                
                <p className="text-sm text-muted-foreground/80 line-clamp-2 mt-auto">
                  {tech.description}
                </p>
              </div>
              
              <div className="bg-background/40 p-4 border-t border-border/30 flex justify-between items-center text-xs font-medium">
                <span className={`px-2 py-1 rounded flex items-center gap-1 ${
                  tech.maturity === 'Mature' ? 'text-blue-400 bg-blue-400/10' :
                  tech.maturity === 'Advanced' ? 'text-purple-400 bg-purple-400/10' :
                  'text-amber-400 bg-amber-400/10'
                }`}>
                  <Star className="w-3 h-3" /> {tech.maturity}
                </span>
                <span className="text-primary hover:underline">View details →</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {selectedTech && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTech(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-card border border-border shadow-2xl rounded-2xl z-50 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="h-2 w-full" style={{ backgroundColor: selectedTech.color }} />
              
              <div className="p-6 md:p-8 overflow-y-auto">
                <button 
                  onClick={() => setSelectedTech(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="mb-6">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-background border border-border text-muted-foreground mr-2">
                    {selectedTech.category}
                  </span>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-background border border-border text-muted-foreground">
                    {selectedTech.maturity}
                  </span>
                </div>

                <h2 className="text-3xl font-bold mb-2">{selectedTech.paradigm}</h2>
                <div className="flex items-center gap-2 text-muted-foreground font-mono mb-8 pb-6 border-b border-border/50">
                  <Layers className="w-4 h-4" style={{ color: selectedTech.color }} />
                  {selectedTech.layer}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h4>
                    <p className="text-foreground/90 leading-relaxed text-sm">
                      {selectedTech.description}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Goal</h4>
                      <div className="font-medium">{selectedTech.goal}</div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1 bg-background/50 p-4 rounded-lg border border-border/50">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Gain</h4>
                        <div className="font-mono text-xl text-[#10B981]">+{selectedTech.gain}%</div>
                      </div>
                      <div className="flex-1 bg-background/50 p-4 rounded-lg border border-border/50">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Complexity</h4>
                        <div className="font-mono text-sm pt-1">{selectedTech.complexity}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Mathematical Formulation</h4>
                  <div className="bg-[#0A1628] p-6 rounded-xl border border-primary/20 font-mono text-primary text-center overflow-x-auto shadow-inner">
                    {selectedTech.formula}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
