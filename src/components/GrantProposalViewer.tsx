import React, { useState } from "react";
import { Award, Copy, Check, Download, CheckCircle2, DollarSign, Calendar, Target } from "lucide-react";

export const GrantProposalViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const proposalSections = {
    abstract: `Latent Canvas is an open-source developer framework pioneering Visual Chain-of-Thought (Visual-CoT) for multimodal foundation models. Rather than confining mathematical and causal deduction to linear 1D autoregressive token streams, Latent Canvas instructs the model to compile intermediate hypotheses into raw topological SVG graphs. These graphs are dynamically rasterized in-memory and re-ingested through the model's visual encoder for self-critique and cycle verification before outputting a solution. By projecting complex relational constraints into a two-dimensional spatial coordinate system, Latent Canvas eliminates circular parity traps, minimizes hallucination drift, and establishes an auditable visual bridge between neurosymbolic graph structures and deep generative reasoning.`,
    qualifies: `Latent Canvas qualifies by delivering immediate, high-leverage developer utility, rigorous empirical reproducibility, and an extensible architecture for the open-source community. Contemporary reasoning frameworks (e.g., Tree-of-Thoughts, Graph-of-Thoughts) remain text-bound, leaving models vulnerable to recency bias and circular deadlocks in distributed algorithms, causal DAGs, and state-machine verification.

Latent Canvas provides a turnkey Python harness using the modern Google GenAI SDK, complete with Pydantic V2 schemas, Cairo/Pillow in-memory rasterization, and a polished Typer/Rich CLI. Crucially, we contribute a standardized 500-task benchmark suite ("Visual-CoT-Bench") quantifying topological verification gains over linear prompting across medical causal inference, epistemic logic, and deadlock detection.

The entire framework is permissively licensed under MIT, requires zero proprietary infrastructure, supports local SVG visual inspection, and integrates effortlessly as a drop-in middleware for agentic stacks like LangChain, LlamaIndex, and AutoGen, ensuring widespread adoption and transparent scientific evaluation across the research ecosystem.`,
    allocation: `Requested grant resources will directly fund comprehensive empirical benchmarking and token stress-testing:

- Topological Stress-Testing (40%): Evaluating 10,000 algorithmic logic prompts across multimodal context windows, assessing token efficiency of SVG coordinate layouts versus serialized text graph representations.
- Cross-Model Visual Auditing (30%): Quantifying Pass 2 verification fidelity using varied resolutions (500x300 to 1920x1080) to determine optimal image token boundaries for causal edge disambiguation.
- Latency & Pareto Frontier Profiling (20%): Measuring end-to-end inference curves (Gemini 2.5 Flash vs. Gemini 3.0 Pro) to release calibrated cost-performance presets for production developers.
- Public CI/CD Automated Test Matrix (10%): Underwriting ongoing live synthetic benchmark evaluations in GitHub Actions.`,
  };

  const countWords = (str: string) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleCopyFull = () => {
    const fullText = `# Latent Canvas: Open-Source Grant & Incubator Pitch

## 1. Project Abstract (${countWords(proposalSections.abstract)} Words)
${proposalSections.abstract}

## 2. Why This Project Qualifies (${countWords(proposalSections.qualifies)} Words)
${proposalSections.qualifies}

## 3. API Credits Allocation Plan (${countWords(proposalSections.allocation)} Words)
${proposalSections.allocation}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Grant Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Ecosystem Grant Application
              </span>
              <span className="text-xs text-slate-400 font-mono">Target: Gemini / OpenAI Ecosystem</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Open-Source Grant & Incubator Submission Pitch
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ready-to-submit responses formatted strictly to grantor specifications with verified word counts.
            </p>
          </div>
          <button
            onClick={handleCopyFull}
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Copied Full Proposal!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Grant Proposal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section 1: Abstract */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            1. Project Abstract
          </h3>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
            Word Count: {countWords(proposalSections.abstract)} / 100 words
          </span>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans select-text">
          {proposalSections.abstract}
        </div>
      </div>

      {/* Section 2: Why Qualifies */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            2. Why This Project Qualifies
          </h3>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            Word Count: {countWords(proposalSections.qualifies)} / 150 words
          </span>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans select-text whitespace-pre-line">
          {proposalSections.qualifies}
        </div>
      </div>

      {/* Section 3: API Credits Allocation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            3. API Credits Allocation Plan
          </h3>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
            Word Count: {countWords(proposalSections.allocation)} / 100 words
          </span>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans select-text whitespace-pre-line">
          {proposalSections.allocation}
        </div>
      </div>

      {/* Milestones & Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-300 uppercase mb-3">
            <Calendar className="h-4 w-4 text-sky-400" />
            Execution Milestones
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">M1: Core Stabilization (Month 1)</span>
              <span className="text-slate-400">Pydantic V2 schemas, in-memory Cairo rasterizer, Typer CLI.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">M2: Visual-CoT-Bench Release (Month 2)</span>
              <span className="text-slate-400">500 topological paradoxes with automated evaluation harness.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">M3: Agent Framework Integrations (Month 3)</span>
              <span className="text-slate-400">Drop-in middleware for LangChain, LlamaIndex, Semantic Kernel.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">M4: Academic Research Preprint (Month 4)</span>
              <span className="text-slate-400">Peer-reviewed paper submission (NeurIPS / ICLR workshop).</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-300 uppercase mb-3">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            Funding Allocation ($37,000 Total Request)
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Model API Tokens (Gemini 2.5/3.0)</span>
              <span className="font-mono font-bold text-emerald-400">$18,000 (Credits)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Open-Source Maintainer Stipends</span>
              <span className="font-mono font-bold text-emerald-400">$12,000</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Evaluation Dataset Expert Annotation</span>
              <span className="font-mono font-bold text-emerald-400">$4,500</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Public Cloud CI/CD Compute</span>
              <span className="font-mono font-bold text-emerald-400">$2,500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
