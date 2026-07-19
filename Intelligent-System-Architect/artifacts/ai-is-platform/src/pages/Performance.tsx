import { useState } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Legend } from "recharts";
import { PERFORMANCE_METRICS, AI_TECHNIQUES } from "../constants/data";
import { Check } from "lucide-react";

export function Performance() {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([
    "Hybrid ML+KB", "Transformer", "GNN", "CNN", "Deep Neural Network"
  ]);

  const toggleTech = (name: string) => {
    setSelectedTechs(prev => 
      prev.includes(name) 
        ? prev.filter(t => t !== name)
        : [...prev, name].slice(-6) // Max 6 for radar readability
    );
  };

  const radarData = [
    { metric: "Accuracy", fullMark: 100 },
    { metric: "Precision", fullMark: 100 },
    { metric: "Recall", fullMark: 100 },
    { metric: "F1-Score", fullMark: 100 },
    { metric: "AUC", fullMark: 100 },
    { metric: "Efficiency", fullMark: 100 }
  ].map(item => {
    const dataPoint: any = { metric: item.metric, fullMark: item.fullMark };
    PERFORMANCE_METRICS.forEach(tech => {
      if (selectedTechs.includes(tech.name)) {
        const key = item.metric.toLowerCase().replace("-", "") as keyof typeof tech;
        dataPoint[tech.name] = tech[key];
      }
    });
    return dataPoint;
  });

  const barData = [...PERFORMANCE_METRICS].sort((a, b) => b.gain - a.gain);

  // Get color for technique
  const getColor = (name: string) => {
    const tech = AI_TECHNIQUES.find(t => t.paradigm === name || t.paradigm.includes(name) || name.includes(t.paradigm));
    return tech ? tech.color : "#6366F1";
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold mb-4">Performance Dashboard</h1>
        <p className="text-muted-foreground max-w-3xl">
          Comparative analysis of AI paradigms across standard classification metrics, computational efficiency, and overall performance gain in enterprise systems.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Controls Panel */}
        <div className="lg:col-span-1 glass-panel rounded-xl p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
            Compare Paradigms
            <span className="text-xs font-normal text-muted-foreground">{selectedTechs.length}/6 selected</span>
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {PERFORMANCE_METRICS.map((tech) => {
              const isSelected = selectedTechs.includes(tech.name);
              const color = getColor(tech.name);
              return (
                <button
                  key={tech.name}
                  onClick={() => toggleTech(tech.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-card border-primary/50 shadow-sm' 
                      : 'bg-background/50 border-border/50 hover:border-primary/30 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-colors ${isSelected ? 'border-transparent' : 'border-muted-foreground/50'}`}
                      style={{ backgroundColor: isSelected ? color : 'transparent' }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : ''}`}>{tech.name}</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-background">
                    +{tech.gain}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Charts Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Radar Chart */}
          <div className="glass-panel rounded-xl p-6 h-[500px] flex flex-col">
            <h3 className="text-lg font-semibold mb-6">Multi-Metric Comparison</h3>
            <div className="flex-1 min-h-0 relative">
              {selectedTechs.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Select paradigms to compare
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--color-muted-foreground)' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {selectedTechs.map((name, i) => (
                      <Radar
                        key={name}
                        name={name}
                        dataKey={name}
                        stroke={getColor(name)}
                        fill={getColor(name)}
                        fillOpacity={0.3}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bar Chart - Full Width */}
      <div className="glass-panel rounded-xl p-6 h-[400px]">
        <h3 className="text-lg font-semibold mb-6">Overall Performance Gain vs Baseline (%)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} 
              angle={-45} 
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: 'var(--color-muted-foreground)' }} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="gain" name="Gain %" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
}
