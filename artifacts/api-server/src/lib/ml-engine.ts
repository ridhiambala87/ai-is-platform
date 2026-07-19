// Pure TypeScript ML engine — no external dependencies
// Implements: CSV parsing, column analysis, KNN, Naive Bayes,
// Linear/Logistic Regression, model recommendations for 15 paper techniques

// ─── CSV Parsing ──────────────────────────────────────────────────────────────

export function parseCSV(csvData: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvData.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length < 2) throw new Error("CSV must have at least a header row and one data row");

  function parseLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });

  return { headers, rows };
}

// ─── Column Statistics ─────────────────────────────────────────────────────────

export interface ColumnStat {
  name: string;
  type: "numeric" | "categorical";
  missing: number;
  unique: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  std: number | null;
  topValues: { value: string; count: number }[];
}

const MISSING_SENTINELS = new Set(["", "null", "nan", "na", "n/a", "none", "undefined"]);

function isMissing(v: string): boolean {
  return MISSING_SENTINELS.has(v.toLowerCase().trim());
}

function r(n: number, d = 4): number {
  return Math.round(n * 10 ** d) / 10 ** d;
}

export function analyzeColumns(headers: string[], rows: Record<string, string>[]): ColumnStat[] {
  return headers.map((name) => {
    const values = rows.map((row) => row[name] ?? "");
    const missing = values.filter(isMissing).length;
    const nonMissing = values.filter((v) => !isMissing(v));

    const nums = nonMissing.map((v) => parseFloat(v)).filter((n) => !isNaN(n));
    const isNumeric = nonMissing.length > 0 && nums.length / nonMissing.length > 0.7;

    const unique = new Set(values).size;
    const counts: Record<string, number> = {};
    values.forEach((v) => { counts[v] = (counts[v] ?? 0) + 1; });
    const topValues = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));

    if (isNumeric && nums.length > 0) {
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
      return { name, type: "numeric", missing, unique, min: r(min), max: r(max), mean: r(mean), std: r(Math.sqrt(variance)), topValues };
    }
    return { name, type: "categorical", missing, unique, min: null, max: null, mean: null, std: null, topValues };
  });
}

// ─── Feature Extraction ────────────────────────────────────────────────────────

export function extractFeatures(
  rows: Record<string, string>[],
  featureCols: string[],
  stats: ColumnStat[],
): number[][] {
  const statMap = new Map(stats.map((c) => [c.name, c]));
  const categoryMaps: Record<string, Record<string, number>> = {};

  featureCols.forEach((col) => {
    const stat = statMap.get(col);
    if (stat?.type === "categorical") {
      const uniq = [...new Set(rows.map((r) => r[col] ?? ""))];
      const map: Record<string, number> = {};
      uniq.forEach((v, i) => { map[v] = i; });
      categoryMaps[col] = map;
    }
  });

  const raw = rows.map((row) =>
    featureCols.map((col) => {
      const stat = statMap.get(col);
      const val = row[col] ?? "";
      if (isMissing(val)) return stat?.mean ?? 0;
      if (stat?.type === "numeric") { const n = parseFloat(val); return isNaN(n) ? (stat.mean ?? 0) : n; }
      return categoryMaps[col]?.[val] ?? 0;
    }),
  );

  // Min-max normalization
  const nf = featureCols.length;
  const mins = Array(nf).fill(Infinity);
  const maxs = Array(nf).fill(-Infinity);
  raw.forEach((row) => row.forEach((v, i) => { mins[i] = Math.min(mins[i], v); maxs[i] = Math.max(maxs[i], v); }));
  return raw.map((row) => row.map((v, i) => { const range = maxs[i] - mins[i]; return range === 0 ? 0 : (v - mins[i]) / range; }));
}

export function extractNumericTarget(rows: Record<string, string>[], col: string): number[] {
  return rows.map((r) => parseFloat(r[col] ?? "")).map((n) => (isNaN(n) ? 0 : n));
}

export function extractStringTarget(rows: Record<string, string>[], col: string): string[] {
  return rows.map((r) => r[col] ?? "");
}

// ─── Train/Test Split ─────────────────────────────────────────────────────────

export function trainTestSplit<T>(
  data: T[],
  testRatio = 0.2,
): { train: T[]; test: T[]; trainIdx: number[]; testIdx: number[] } {
  const testSize = Math.max(1, Math.floor(data.length * testRatio));
  const indices = data.map((_, i) => i);
  let seed = 42;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
  const testIdx = indices.slice(0, testSize).sort((a, b) => a - b);
  const trainIdx = indices.slice(testSize).sort((a, b) => a - b);
  return { train: trainIdx.map((i) => data[i]), test: testIdx.map((i) => data[i]), trainIdx, testIdx };
}

// ─── KNN ──────────────────────────────────────────────────────────────────────

function euclidean(a: number[], b: number[]): number {
  let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2; return Math.sqrt(s);
}

export function knnClassify(trainX: number[][], trainY: string[], testX: number[][], k = 5): string[] {
  return testX.map((x) => {
    const dists = trainX.map((t, i) => ({ d: euclidean(t, x), y: trainY[i] })).sort((a, b) => a.d - b.d).slice(0, k);
    const counts: Record<string, number> = {};
    dists.forEach((n) => { counts[n.y] = (counts[n.y] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  });
}

export function knnRegress(trainX: number[][], trainY: number[], testX: number[][], k = 5): number[] {
  return testX.map((x) => {
    const dists = trainX.map((t, i) => ({ d: euclidean(t, x), y: trainY[i] })).sort((a, b) => a.d - b.d).slice(0, k);
    return dists.reduce((s, n) => s + n.y, 0) / dists.length;
  });
}

// ─── Naive Bayes (Gaussian) ────────────────────────────────────────────────────

export function naiveBayes(trainX: number[][], trainY: string[], testX: number[][]): string[] {
  const classes = [...new Set(trainY)];
  const stats: Record<string, { prior: number; means: number[]; vars: number[] }> = {};

  classes.forEach((cls) => {
    const idx = trainY.map((y, i) => (y === cls ? i : -1)).filter((i) => i >= 0);
    const subset = idx.map((i) => trainX[i]);
    const prior = idx.length / trainY.length;
    const d = trainX[0]?.length ?? 0;
    const means = Array(d).fill(0);
    const vars = Array(d).fill(0);
    subset.forEach((row) => row.forEach((v, i) => { means[i] += v; }));
    means.forEach((_, i) => { means[i] /= subset.length || 1; });
    subset.forEach((row) => row.forEach((v, i) => { vars[i] += (v - means[i]) ** 2; }));
    vars.forEach((_, i) => { vars[i] = vars[i] / (subset.length || 1) + 1e-9; });
    stats[cls] = { prior, means, vars };
  });

  return testX.map((x) => {
    let best = classes[0]; let bestScore = -Infinity;
    classes.forEach((cls) => {
      const { prior, means, vars } = stats[cls];
      let score = Math.log(prior);
      x.forEach((v, i) => { score += -0.5 * Math.log(2 * Math.PI * vars[i]) - (v - means[i]) ** 2 / (2 * vars[i]); });
      if (score > bestScore) { bestScore = score; best = cls; }
    });
    return best;
  });
}

// ─── Logistic Regression (Gradient Descent) ───────────────────────────────────

function sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }

export function logisticRegression(trainX: number[][], trainY: string[], testX: number[][], iters = 500, lr = 0.1): string[] {
  const classes = [...new Set(trainY)].sort();
  if (classes.length !== 2) return naiveBayes(trainX, trainY, testX);

  const pos = classes[1];
  const yb = trainY.map((y) => (y === pos ? 1 : 0));
  const n = trainX.length;
  const d = trainX[0]?.length ?? 0;
  const X = trainX.map((row) => [1, ...row]);
  const Xt = testX.map((row) => [1, ...row]);
  const w = Array(d + 1).fill(0);

  for (let it = 0; it < iters; it++) {
    const preds = X.map((row) => sigmoid(row.reduce((s, v, i) => s + v * w[i], 0)));
    const errs = preds.map((p, i) => p - yb[i]);
    for (let j = 0; j <= d; j++) {
      let g = 0; for (let i = 0; i < n; i++) g += errs[i] * X[i][j];
      w[j] -= (lr * g) / n;
    }
  }

  return Xt.map((row) => (sigmoid(row.reduce((s, v, i) => s + v * w[i], 0)) >= 0.5 ? pos : classes[0]));
}

// ─── Linear Regression (Gradient Descent) ─────────────────────────────────────

export function linearRegression(trainX: number[][], trainY: number[], testX: number[][], iters = 1000, lr = 0.01): number[] {
  const n = trainX.length;
  const d = trainX[0]?.length ?? 0;
  const X = trainX.map((row) => [1, ...row]);
  const Xt = testX.map((row) => [1, ...row]);
  const w = Array(d + 1).fill(0);

  for (let it = 0; it < iters; it++) {
    const preds = X.map((row) => row.reduce((s, v, i) => s + v * w[i], 0));
    const errs = preds.map((p, i) => p - trainY[i]);
    for (let j = 0; j <= d; j++) {
      let g = 0; for (let i = 0; i < n; i++) g += errs[i] * X[i][j];
      w[j] -= (lr * g) / n;
    }
  }

  return Xt.map((row) => row.reduce((s, v, i) => s + v * w[i], 0));
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface ClassMetrics { accuracy: number; precision: number; recall: number; f1: number }
export interface RegMetrics { mae: number; rmse: number; r2: number }

export function classificationMetrics(actual: string[], predicted: string[]): ClassMetrics {
  const n = actual.length;
  const correct = actual.filter((a, i) => a === predicted[i]).length;
  const classes = [...new Set(actual)];
  let tp_sum = 0, fp_sum = 0, fn_sum = 0;
  classes.forEach((cls) => {
    const tp = actual.filter((a, i) => a === cls && predicted[i] === cls).length;
    const fp = actual.filter((a, i) => a !== cls && predicted[i] === cls).length;
    const fn = actual.filter((a, i) => a === cls && predicted[i] !== cls).length;
    tp_sum += tp; fp_sum += fp; fn_sum += fn;
  });
  const precision = tp_sum + fp_sum === 0 ? 0 : tp_sum / (tp_sum + fp_sum);
  const recall = tp_sum + fn_sum === 0 ? 0 : tp_sum / (tp_sum + fn_sum);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { accuracy: r(correct / n), precision: r(precision), recall: r(recall), f1: r(f1) };
}

export function regressionMetrics(actual: number[], predicted: number[]): RegMetrics {
  const n = actual.length;
  const mae = actual.reduce((s, a, i) => s + Math.abs(a - predicted[i]), 0) / n;
  const rmse = Math.sqrt(actual.reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0) / n);
  const meanA = actual.reduce((a, b) => a + b, 0) / n;
  const ssTot = actual.reduce((s, a) => s + (a - meanA) ** 2, 0);
  const ssRes = actual.reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0);
  return { mae: r(mae), rmse: r(rmse), r2: r(ssTot === 0 ? 0 : 1 - ssRes / ssTot) };
}

// ─── Model Recommendations ────────────────────────────────────────────────────

interface DatasetProfile {
  rows: number;
  cols: number;
  taskType: "classification" | "regression" | "clustering";
  numericRatio: number;   // 0-1
  missingRatio: number;   // 0-1
  numClasses: number;     // for classification
}

interface TechniqueProfile {
  paradigm: string;
  category: string;
  color: string;
  maturity: string;
  tasks: string[];
  paperGain: number;
  sizeMin: number;
  sizeMax: number;
  reasonsClassification: string[];
  reasonsRegression: string[];
  reasonsClustering: string[];
  penaltyHighDim: boolean;
  penaltySmallData: boolean;
  needsNumerical: boolean;
}

const TECHNIQUES: TechniqueProfile[] = [
  { paradigm: "Logistic Regression", category: "Supervised", color: "#3B82F6", maturity: "Mature", tasks: ["classification"], paperGain: 12, sizeMin: 100, sizeMax: 1e7, reasonsClassification: ["Interpretable linear classifier ideal for binary/multi-class tasks", "Fast training with low computational cost O(T·N·d)", "Well-calibrated probability outputs"], reasonsRegression: [], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: false, needsNumerical: true },
  { paradigm: "SVM", category: "Supervised", color: "#6366F1", maturity: "Mature", tasks: ["classification", "regression"], paperGain: 15, sizeMin: 50, sizeMax: 100000, reasonsClassification: ["Maximum margin classifier robust to high-dimensional features", "Effective with clear class separation", "Kernel trick handles nonlinear boundaries"], reasonsRegression: ["SVR minimizes structural risk for robust regression", "Handles high-dimensional feature spaces well"], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: false, needsNumerical: true },
  { paradigm: "Random Forest", category: "Ensemble", color: "#8B5CF6", maturity: "Mature", tasks: ["classification", "regression"], paperGain: 18, sizeMin: 100, sizeMax: 1e7, reasonsClassification: ["Variance reduction via bagging handles noisy features", "Built-in feature importance for interpretability", "Robust to missing values and class imbalance"], reasonsRegression: ["Ensemble of trees captures nonlinear relationships", "Low bias-variance tradeoff via averaging", "Feature importance aids domain understanding"], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: false, needsNumerical: false },
  { paradigm: "Deep Neural Network", category: "Deep Learning", color: "#A855F7", maturity: "Advanced", tasks: ["classification", "regression"], paperGain: 22, sizeMin: 1000, sizeMax: 1e9, reasonsClassification: ["Learns complex nonlinear feature hierarchies h=σ(Wx+b)", "Superior performance on high-dimensional data", "Flexible architecture for multi-output classification"], reasonsRegression: ["Captures nonlinear patterns in enterprise time-series", "Deep architectures model complex input-output mappings"], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: true, needsNumerical: true },
  { paradigm: "CNN", category: "Deep Learning", color: "#C026D3", maturity: "Advanced", tasks: ["classification"], paperGain: 25, sizeMin: 1000, sizeMax: 1e9, reasonsClassification: ["Convolutional feature abstraction ideal for structured grid data", "Reduces parameter count via weight sharing", "State-of-the-art for image and spatial feature patterns"], reasonsRegression: [], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: true, needsNumerical: true },
  { paradigm: "Transformer", category: "Deep Learning", color: "#7C3AED", maturity: "Emerging", tasks: ["classification", "regression"], paperGain: 28, sizeMin: 5000, sizeMax: 1e9, reasonsClassification: ["Self-attention captures global context: Attention(Q,K,V)=softmax(QKᵀ/√dₖ)V", "Best-in-class for sequential and tabular enterprise data", "Pre-trained transformers enable transfer learning"], reasonsRegression: ["Contextual modeling of long-range feature dependencies", "Tab-Transformer variants excel on heterogeneous tabular data"], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: true, needsNumerical: false },
  { paradigm: "Reinforcement Learning", category: "Adaptive", color: "#2563EB", maturity: "Emerging", tasks: ["clustering"], paperGain: 20, sizeMin: 0, sizeMax: 1e9, reasonsClassification: [], reasonsRegression: [], reasonsClustering: ["Policy-gradient optimization for adaptive decision-making", "Sequential data exploration via reward maximization", "Self-improving system for dynamic environment modeling"], penaltyHighDim: false, penaltySmallData: false, needsNumerical: false },
  { paradigm: "Autoencoder", category: "Deep Learning", color: "#1D4ED8", maturity: "Advanced", tasks: ["classification", "clustering"], paperGain: 23, sizeMin: 500, sizeMax: 1e9, reasonsClassification: ["Unsupervised feature learning for anomaly-based classification", "Bottleneck representation captures latent structure", "Effective for high-dimensional data compression"], reasonsRegression: [], reasonsClustering: ["Learns compact latent representations for clustering", "Reconstruction error surfaces outliers effectively"], penaltyHighDim: false, penaltySmallData: true, needsNumerical: true },
  { paradigm: "Graph Neural Network", category: "Graph", color: "#0891B2", maturity: "Advanced", tasks: ["classification", "regression"], paperGain: 27, sizeMin: 500, sizeMax: 1e9, reasonsClassification: ["Aggregates neighborhood features: hᵥ=σ(W·AGG(neighbors))", "Effective when data has relational or graph structure", "State-of-the-art for entity relationship classification"], reasonsRegression: ["Message-passing captures feature interactions in relational data", "Suitable for molecular and network property prediction"], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: true, needsNumerical: false },
  { paradigm: "Knowledge-Based Reasoning", category: "Symbolic", color: "#059669", maturity: "Mature", tasks: ["classification", "clustering"], paperGain: 16, sizeMin: 0, sizeMax: 50000, reasonsClassification: ["Logical inference KB⊨q enables rule-based classification", "High interpretability with domain knowledge integration", "Excellent for small structured datasets with prior knowledge"], reasonsRegression: [], reasonsClustering: ["Ontology-driven clustering using semantic relationships", "Transparent reasoning process for audit-ready AI"], penaltyHighDim: true, penaltySmallData: false, needsNumerical: false },
  { paradigm: "Federated Learning", category: "Distributed", color: "#10B981", maturity: "Emerging", tasks: ["classification", "regression"], paperGain: 19, sizeMin: 1000, sizeMax: 1e9, reasonsClassification: ["Privacy-preserving collaborative learning w_global=Σ(nₖ/N)wₖ", "Suitable for distributed multi-source datasets", "No raw data sharing — strong regulatory compliance"], reasonsRegression: ["Federated regression across distributed data silos", "Reduces communication while maintaining model accuracy"], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: true, needsNumerical: false },
  { paradigm: "Hybrid ML + KB", category: "Hybrid", color: "#F59E0B", maturity: "Emerging", tasks: ["classification", "regression"], paperGain: 30, sizeMin: 200, sizeMax: 1e9, reasonsClassification: ["Highest gain: ŷ=α·f_ML(x)+(1-α)·f_KB(x) — best of both worlds", "Statistical power + logical reasoning → 30% performance gain", "Robust interpretability without sacrificing accuracy"], reasonsRegression: ["Fusion model reduces overfitting through symbolic constraints", "Domain rules correct ML model errors in edge cases"], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: false, needsNumerical: false },
  { paradigm: "Ensemble Learning", category: "Ensemble", color: "#EF4444", maturity: "Mature", tasks: ["classification", "regression"], paperGain: 26, sizeMin: 100, sizeMax: 1e9, reasonsClassification: ["Weighted combination ŷ=Σαₘhₘ(x) reduces variance", "Handles class imbalance via diverse base classifiers", "Consistently top performer across benchmark datasets"], reasonsRegression: ["Boosting/bagging reduces bias and variance simultaneously", "Feature randomization provides implicit regularization"], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: false, needsNumerical: false },
  { paradigm: "Edge AI", category: "Distributed", color: "#F97316", maturity: "Emerging", tasks: ["classification", "regression"], paperGain: 35, sizeMin: 0, sizeMax: 1e9, reasonsClassification: ["35% latency reduction via model pruning for real-time inference", "Constrained optimization: min L(θ) s.t. Memory<M, Latency<T", "Ideal for IoT and edge deployment scenarios"], reasonsRegression: ["Lightweight regression for resource-constrained environments", "TinyML enables on-device predictive analytics"], reasonsClustering: [], penaltyHighDim: true, penaltySmallData: false, needsNumerical: true },
  { paradigm: "Explainable AI (XAI)", category: "Governance", color: "#EC4899", maturity: "Advanced", tasks: ["classification", "regression"], paperGain: 40, sizeMin: 100, sizeMax: 1e9, reasonsClassification: ["40% interpretability gain via Shapley values φᵢ=Σ[f(S∪{i})-f(S)]", "GDPR/regulatory compliance through transparent decisions", "Trust-critical environments (healthcare, finance) benefit most"], reasonsRegression: ["Feature attribution reveals most impactful predictors", "LIME/SHAP explanations support model debugging and governance"], reasonsClustering: [], penaltyHighDim: false, penaltySmallData: false, needsNumerical: false },
];

export interface ModelRecommendation {
  rank: number;
  paradigm: string;
  category: string;
  color: string;
  score: number;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
  rmse: number | null;
  r2: number | null;
  reasons: string[];
  isImplemented: boolean;
  maturity: string;
}

export function recommendModels(profile: DatasetProfile): ModelRecommendation[] {
  const scored = TECHNIQUES.map((t) => {
    let score = 0;
    const reasons: string[] = [];

    // Task compatibility (0–40 pts)
    if (t.tasks.includes(profile.taskType)) {
      score += 40;
      const taskReasons = profile.taskType === "classification" ? t.reasonsClassification
        : profile.taskType === "regression" ? t.reasonsRegression : t.reasonsClustering;
      reasons.push(...taskReasons.slice(0, 2));
    } else {
      score -= 20;
      reasons.push(`Not optimal for ${profile.taskType} — consider for other tasks`);
    }

    // Dataset size (0–20 pts)
    if (profile.rows >= t.sizeMin && profile.rows <= t.sizeMax) {
      score += 20;
    } else if (profile.rows < t.sizeMin) {
      score -= 10;
      if (t.penaltySmallData) { score -= 10; reasons.push("Requires more data for reliable training"); }
    }

    // Dimensionality penalty
    if (t.penaltyHighDim && profile.cols > 20) { score -= 5; reasons.push("High dimensionality may reduce effectiveness"); }

    // Missing data bonus
    if (profile.missingRatio < 0.05) score += 5;
    else if (profile.missingRatio > 0.2) score -= 5;

    // Paper performance gain bonus (0–15 pts normalized)
    score += Math.round((t.paperGain / 40) * 15);

    // Maturity bonus
    if (t.maturity === "Mature") score += 5;
    else if (t.maturity === "Advanced") score += 3;

    // Simulate estimated metrics for non-implemented models based on paper data
    const baseAcc = 0.70 + (t.paperGain / 40) * 0.20;
    const sizeBonus = Math.min(0.05, Math.log10(Math.max(profile.rows, 10)) / 100);
    const estimatedAcc = Math.min(0.97, baseAcc + sizeBonus);

    return {
      technique: t,
      score: Math.max(0, score),
      reasons: reasons.length ? reasons : [`${t.paradigm} is applicable to this ${profile.taskType} task`],
      estimatedAcc,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((item, i) => ({
    rank: i + 1,
    paradigm: item.technique.paradigm,
    category: item.technique.category,
    color: item.technique.color,
    score: item.score,
    accuracy: item.technique.tasks.includes(profile.taskType) ? r(item.estimatedAcc) : null,
    precision: item.technique.tasks.includes(profile.taskType) ? r(item.estimatedAcc - 0.01) : null,
    recall: item.technique.tasks.includes(profile.taskType) ? r(item.estimatedAcc - 0.02) : null,
    f1: item.technique.tasks.includes(profile.taskType) ? r(item.estimatedAcc - 0.015) : null,
    rmse: profile.taskType === "regression" && item.technique.tasks.includes("regression") ? r(0.2 - (item.technique.paperGain / 40) * 0.1) : null,
    r2: profile.taskType === "regression" && item.technique.tasks.includes("regression") ? r(item.estimatedAcc) : null,
    reasons: item.reasons,
    isImplemented: false,
    maturity: item.technique.maturity,
  }));
}
