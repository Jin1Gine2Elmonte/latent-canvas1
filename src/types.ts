export interface TopologicalObservation {
  id?: string;
  text: string;
  type?: "cycle" | "bottleneck" | "d-separation" | "axiom" | "normal";
}

export interface VisualScratchpadData {
  latent_graph_svg: string;
  rasterized_png_base64?: string;
  topological_observations: string[];
  initial_hypothesis: string;
}

export interface SelfCritiqueData {
  visual_anomalies_detected: string[];
  cycle_detected: boolean;
  discrepancy_analysis: string;
  confidence_score: number;
  proof_summary?: string;
  final_answer?: string;
}

export interface ExecutionResult {
  success: boolean;
  isLiveExecution: boolean;
  model?: string;
  query: string;
  pass1: VisualScratchpadData;
  pass2: SelfCritiqueData;
  metrics: {
    executionTimeMs: number;
    svgLength: number;
    observationsCount: number;
    confidence: number;
  };
  notice?: string;
}

export interface ProjectFile {
  path: string;
  category: string;
  language: string;
  content: string;
  lines: number;
  sizeBytes: number;
}
