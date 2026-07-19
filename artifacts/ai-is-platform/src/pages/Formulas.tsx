import { motion } from "framer-motion";
import { AI_TECHNIQUES } from "../constants/data";

export function Formulas() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 font-mono">Mathematical Foundations</h1>
        <p className="text-muted-foreground max-w-3xl">
          The formal mathematical models underpinning the 15 AI paradigms evaluated in the paper. Rendered for precise reference.
        </p>
      </motion.div>

      <div className="space-y-6">
        {AI_TECHNIQUES.map((tech, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            key={tech.id}
            className="flex flex-col md:flex-row glass-panel rounded-xl overflow-hidden border border-border/50 group hover:border-primary/50 transition-colors"
          >
            {/* Number Indicator */}
            <div className="bg-background/80 w-full md:w-16 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-border/50 font-mono text-xl text-muted-foreground group-hover:text-primary transition-colors">
              {String(i + 1).padStart(2, '0')}
            </div>
            
            {/* Context/Meta */}
            <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-border/50 flex flex-col justify-center">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-background w-fit mb-3 text-muted-foreground" style={{ color: tech.color }}>
                {tech.category}
              </span>
              <h3 className="text-lg font-bold mb-1">{tech.paradigm}</h3>
              <p className="text-sm text-muted-foreground font-mono">App: {tech.layer}</p>
            </div>
            
            {/* Formula Display */}
            <div className="p-6 md:w-2/3 flex items-center justify-center bg-[#0A1628]/50 overflow-x-auto">
              <div className="font-mono text-lg md:text-xl text-primary whitespace-nowrap px-4 py-3 bg-background/50 rounded-lg border border-border/30 shadow-inner">
                {tech.formula}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
