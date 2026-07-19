import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuthLogout, useMlAnalyze } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, LogOut, Upload, FileType, CheckCircle2, XCircle, 
  Database, AlertCircle, Loader2, BarChart2, TrendingUp, Cpu, List, FileText, Medal, Lock,
  Brain
} from 'lucide-react';
import type { MLAnalysisResult, MLColumnStat, MLModelResult, MLPrediction } from '@workspace/api-client-react';

export default function MLPlayground() {
  const { user, isLoading, refetch } = useAuth();
  const [, navigate] = useLocation();
  const { mutate: logout } = useAuthLogout();
  
  // Playground state
  const [csvData, setCsvData] = useState<string>('');
  const [datasetName, setDatasetName] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [fileInfo, setFileInfo] = useState<{name: string, size: string, estRows: number} | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MLAnalysisResult | null>(null);
  
  const { mutate: analyze, isPending, error: analyzeError } = useMlAnalyze();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication Guard
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-background pt-16 flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Authentication Required</h2>
            <p className="text-muted-foreground mt-2">Sign in to use the ML Playground and analyze datasets.</p>
          </div>
          <Link href="/login" className="inline-flex justify-center items-center py-2.5 px-6 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors w-full">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        refetch();
        navigate('/');
      }
    });
  };

  const handleFileChange = (file: File | null | undefined) => {
    if (!file) return;
    
    // Check if it's a CSV
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      alert("Please upload a CSV file");
      return;
    }
    
    setDatasetName(file.name.replace('.csv', ''));
    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      estRows: 0 // Will estimate after parse
    });
    setAnalysisResult(null); // Reset previous analysis

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      
      // Simple parse for headers and est rows
      const lines = text.split('\n');
      setFileInfo(prev => prev ? {...prev, estRows: lines.length > 1 ? lines.length - 1 : 0} : null);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')).filter(Boolean);
        setColumns(headers);
        if (headers.length > 0) setTargetColumn(headers[headers.length - 1]); // default to last
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!csvData) return;
    
    analyze(
      { data: { csvData, targetColumn, datasetName: datasetName || 'dataset' } },
      {
        onSuccess: (data) => {
          setAnalysisResult(data);
        }
      }
    );
  };

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-background pt-16 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-border/50 bg-card/20 flex flex-col fixed md:sticky top-16 z-20 h-auto md:h-[calc(100vh-4rem)]">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground">ML Playground</h2>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0">
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <div className="w-full h-px bg-border/50 mb-6" />
          
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Sessions</h3>
            <div className="text-sm text-muted-foreground italic flex flex-col items-center justify-center py-8 bg-card/30 rounded-lg border border-border/30 border-dashed">
              <Database className="w-6 h-6 mb-2 opacity-50" />
              <span>No previous sessions</span>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-border/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full p-2 rounded-lg hover:bg-card/50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative pb-24 min-h-[calc(100vh-4rem)]">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isPending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="glass-panel p-8 rounded-2xl flex flex-col items-center max-w-sm w-full">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-accent animate-[spin_1.5s_linear_infinite_reverse]"></div>
                  <div className="absolute inset-4 rounded-full border-b-2 border-indigo-300 animate-spin"></div>
                  <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Analyzing Dataset...</h3>
                <div className="h-6 mt-2 overflow-hidden flex flex-col items-center text-sm text-muted-foreground">
                  <motion.div
                    animate={{ y: [0, -24, -48, -72] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col items-center"
                  >
                    <span className="h-6 flex items-center">Parsing CSV data...</span>
                    <span className="h-6 flex items-center">Detecting feature types...</span>
                    <span className="h-6 flex items-center">Evaluating architectures...</span>
                    <span className="h-6 flex items-center">Ranking recommendations...</span>
                    <span className="h-6 flex items-center">Parsing CSV data...</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          
          {/* Phase 1: Upload */}
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dataset Analysis</h1>
              <p className="text-muted-foreground mt-1">Upload tabular data to discover the optimal ML/DL architectures.</p>
            </div>

            <div 
              className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 cursor-pointer ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-card/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
            </div>

            {fileInfo && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-card flex items-center justify-center border border-border shrink-0">
                      <FileType className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{fileInfo.name}</h4>
                      <p className="text-sm text-muted-foreground">{fileInfo.size} • ~{fileInfo.estRows} rows</p>
                    </div>
                  </div>

                  <div className="flex-1 max-w-sm space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Dataset Name</label>
                      <input 
                        type="text" 
                        value={datasetName}
                        onChange={(e) => setDatasetName(e.target.value)}
                        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary font-mono"
                      />
                    </div>
                    {columns.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Target Variable</label>
                        <select
                          value={targetColumn}
                          onChange={(e) => setTargetColumn(e.target.value)}
                          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary font-mono"
                        >
                          <option value="">None (Clustering/Unsupervised)</option>
                          {columns.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end pt-4 border-t border-border/50">
                  <button
                    onClick={handleAnalyze}
                    disabled={isPending || !csvData}
                    className="flex items-center gap-2 py-2 px-6 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    Analyze Dataset
                  </button>
                </div>
              </motion.div>
            )}
            
            {analyzeError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive-foreground p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                <div>
                  <h4 className="font-semibold text-destructive">Analysis Failed</h4>
                  <p className="text-sm mt-1">{(analyzeError as any)?.data?.error ?? 'An unknown error occurred during analysis.'}</p>
                </div>
              </div>
            )}
          </section>

          {/* Phase 2, 3, 4: Results */}
          {analysisResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ staggerChildren: 0.2 }}
              className="space-y-8"
            >
              {/* Overview Banner */}
              <motion.section className="glass-panel rounded-2xl overflow-hidden border border-primary/20 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                <div className="p-6 md:p-8 relative z-10">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        Analysis Complete
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          analysisResult.taskType === 'classification' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          analysisResult.taskType === 'regression' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {analysisResult.taskType.toUpperCase()}
                        </span>
                      </h2>
                      <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">{analysisResult.summary}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                      <div className="text-muted-foreground text-sm flex items-center gap-2 mb-1"><List className="w-4 h-4"/> Rows</div>
                      <div className="text-2xl font-bold font-mono">{analysisResult.rows.toLocaleString()}</div>
                    </div>
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                      <div className="text-muted-foreground text-sm flex items-center gap-2 mb-1"><List className="w-4 h-4"/> Columns</div>
                      <div className="text-2xl font-bold font-mono">{analysisResult.columns}</div>
                    </div>
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                      <div className="text-muted-foreground text-sm flex items-center gap-2 mb-1"><Database className="w-4 h-4"/> Target</div>
                      <div className="text-xl font-bold truncate">{analysisResult.targetColumn || 'N/A'}</div>
                    </div>
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                      <div className="text-muted-foreground text-sm flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4"/> Missing</div>
                      <div className="text-2xl font-bold font-mono text-amber-400">
                        {Math.round(analysisResult.columnStats.reduce((acc: number, c: MLColumnStat) => acc + c.missing, 0) / (analysisResult.rows * analysisResult.columns) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="border border-border/50 rounded-xl overflow-hidden bg-background/50">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-card/80 text-muted-foreground text-xs uppercase font-semibold">
                          <tr>
                            <th className="px-4 py-3">Feature</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Missing</th>
                            <th className="px-4 py-3">Unique</th>
                            <th className="px-4 py-3">Mean / Mode</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 font-mono text-sm">
                          {analysisResult.columnStats.slice(0, 8).map((col: MLColumnStat, idx: number) => (
                            <tr key={idx} className="hover:bg-card/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-foreground">{col.name}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  col.type === 'numeric' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                }`}>
                                  {col.type}
                                </span>
                              </td>
                              <td className={`px-4 py-3 ${col.missing > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>{col.missing}</td>
                              <td className="px-4 py-3 text-muted-foreground">{col.unique}</td>
                              <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                                {col.type === 'numeric' && col.mean != null ? col.mean.toFixed(2) : 
                                 col.topValues.length > 0 ? col.topValues[0].value : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {analysisResult.columns > 8 && (
                      <div className="px-4 py-2 bg-card/30 text-xs text-muted-foreground text-center border-t border-border/50">
                        + {analysisResult.columns - 8} more columns omitted for preview
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>

              {/* Recommendations */}
              <motion.section>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    Model Recommendations
                  </h3>
                  <p className="text-muted-foreground text-sm">Ranked by compatibility with your data topology</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {analysisResult.recommendations.slice(0, 3).map((rec: MLModelResult, i: number) => (
                    <div key={rec.paradigm} className={`relative glass-panel rounded-xl p-6 border ${
                      i === 0 ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] bg-amber-500/5' : 
                      i === 1 ? 'border-slate-300/30 bg-slate-300/5' : 'border-amber-700/30 bg-amber-700/5'
                    }`}>
                      {i === 0 && <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold shadow-lg"><Medal className="w-4 h-4"/></div>}
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded bg-black/40 border ${
                          i === 0 ? 'border-amber-500/50 text-amber-400' : 
                          i === 1 ? 'border-slate-400/50 text-slate-300' : 'border-amber-700/50 text-amber-600'
                        }`}>
                          Rank #{rec.rank}
                        </span>
                        <span className="text-2xl font-bold font-mono" style={{ color: rec.color }}>{rec.score}</span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-foreground mb-1">{rec.paradigm}</h4>
                      <div className="text-xs text-muted-foreground mb-4 opacity-80">{rec.category}</div>
                      
                      <div className="space-y-3 mb-4 text-sm">
                        {rec.reasons.slice(0, 2).map((r: string, j: number) => (
                          <div key={j} className="flex items-start gap-2 text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500/70" />
                            <span className="leading-tight">{r}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-border/50 mt-auto">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Suitability</span>
                          <span style={{ color: rec.color }}>{rec.score}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${rec.score}%`, backgroundColor: rec.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {analysisResult.recommendations.slice(3).map((rec: MLModelResult) => (
                    <div key={rec.paradigm} className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center gap-4 border border-border/50 hover:bg-card/40 transition-colors">
                      <div className="flex items-center gap-4 w-full md:w-1/4 shrink-0">
                        <div className="text-muted-foreground font-mono font-bold w-6 text-right">#{rec.rank}</div>
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{rec.paradigm}</h4>
                          <span className="text-[10px] text-muted-foreground">{rec.category}</span>
                        </div>
                      </div>
                      
                      <div className="w-full md:flex-1 hidden md:flex items-center gap-3">
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${rec.score}%`, backgroundColor: rec.color }} />
                        </div>
                        <span className="font-mono text-sm w-8" style={{ color: rec.color }}>{rec.score}</span>
                      </div>

                      <div className="w-full md:w-auto text-xs text-muted-foreground md:text-right hidden lg:block max-w-sm truncate">
                        {rec.reasons[0]}
                      </div>

                      <div className="shrink-0 flex gap-2">
                        {rec.isImplemented ? (
                          <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Implemented ✓</span>
                        ) : (
                          <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-muted text-muted-foreground border border-border">Theory Only</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Predictions Preview */}
              {analysisResult.predictions.length > 0 && (
                <motion.section>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-primary" />
                      Sample Evaluation ({analysisResult.overallBestModel})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Metrics */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="glass-panel p-6 rounded-xl border-t border-t-primary/50">
                        <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4"/> Validation Accuracy
                        </div>
                        <div className="text-4xl font-bold font-mono text-foreground">
                          {analysisResult.testAccuracy ? (analysisResult.testAccuracy * 100).toFixed(1) : '--'}%
                        </div>
                      </div>
                      <div className="glass-panel p-6 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <Database className="w-4 h-4"/> Training Accuracy
                        </div>
                        <div className="text-3xl font-bold font-mono text-muted-foreground">
                          {analysisResult.trainAccuracy ? (analysisResult.trainAccuracy * 100).toFixed(1) : '--'}%
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden border border-border/50">
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-card/80 text-muted-foreground text-xs uppercase font-semibold sticky top-0 backdrop-blur z-10 shadow-sm">
                            <tr>
                              <th className="px-4 py-3 w-16">Row</th>
                              <th className="px-4 py-3">Actual Value</th>
                              <th className="px-4 py-3">Predicted Value</th>
                              <th className="px-4 py-3 text-right">Result</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50 font-mono text-sm">
                            {analysisResult.predictions.map((pred: MLPrediction) => (
                              <tr key={pred.index} className={`transition-colors ${pred.correct ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'bg-destructive/5 hover:bg-destructive/10'}`}>
                                <td className="px-4 py-2.5 text-muted-foreground">#{pred.index}</td>
                                <td className="px-4 py-2.5 text-foreground">{pred.actual}</td>
                                <td className="px-4 py-2.5 text-foreground">{pred.predicted}</td>
                                <td className="px-4 py-2.5 text-right">
                                  {pred.correct ? (
                                    <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                      <CheckCircle2 className="w-3 h-3"/> Correct
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-destructive text-xs font-semibold uppercase bg-destructive/10 px-2 py-0.5 rounded border border-destructive/30">
                                      <XCircle className="w-3 h-3"/> Error
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
