"""
Core execution engine for Latent Canvas Visual-CoT framework.

Implements the two-pass feedback loop using the modern Google GenAI SDK:
  Pass 1: Deconstruct query into structured JSON with topological SVG graph.
  Rasterize: In-memory SVG to PNG rasterization without disk overhead.
  Pass 2: Multimodal inspection sending the rasterized diagram back to the model
          for visual discrepancy audit and verified resolution.
"""

import json
import logging
import os
import time
from typing import Callable, Optional, Tuple

from google import genai
from google.genai import types

from latent_canvas.prompts import (
    LATENT_CANVAS_SYSTEM_PROMPT,
    VERIFICATION_SYSTEM_PROMPT,
)
from latent_canvas.renderer import render_svg_to_png
from latent_canvas.schema import (
    SelfCritique,
    VerifiedResolution,
    VisualScratchpad,
)

logger = logging.getLogger("latent_canvas.core")


class LatentCanvas:
    """
    Main orchestrator for Visual Chain-of-Thought reasoning.

    Attributes:
        client: Initialized Google GenAI SDK client.
        model_name: Default Gemini model to invoke (e.g. 'gemini-2.5-flash').
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-2.5-flash",
    ) -> None:
        """
        Initialize Latent Canvas with optional API key and target model.

        If api_key is omitted, client will discover GEMINI_API_KEY from environment.
        """
        resolved_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not resolved_key:
            logger.warning(
                "GEMINI_API_KEY not found in environment or constructor arguments. "
                "Ensure GEMINI_API_KEY is exported before calling solve()."
            )

        self.client = genai.Client(api_key=resolved_key) if resolved_key else genai.Client()
        self.model_name = model_name

    def _execute_pass_1(
        self,
        query: str,
        system_instruction: str = LATENT_CANVAS_SYSTEM_PROMPT,
    ) -> VisualScratchpad:
        """
        Pass 1: Query -> Structured JSON containing topological SVG.
        """
        logger.info("Executing Pass 1: Topological graph construction...")

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[
                types.Part.from_text(
                    text=(
                        f"USER PROBLEM / REASONING TASK:\n{query}\n\n"
                        "Synthesize the complete topological causal graph representing "
                        "all entities, constraints, and transition hypotheses. "
                        "Return strict JSON matching the schema."
                    )
                )
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=VisualScratchpad,
                temperature=0.2,
            ),
        )

        raw_text = response.text or "{}"
        try:
            scratchpad = VisualScratchpad.model_validate_json(raw_text)
        except Exception as err:
            logger.error("Pass 1 validation failed on output: %s", raw_text)
            # Resilient fallback: attempt manual extraction if wrapped
            data = json.loads(raw_text)
            scratchpad = VisualScratchpad(**data)

        return scratchpad

    def _execute_pass_2(
        self,
        query: str,
        scratchpad: VisualScratchpad,
        png_bytes: bytes,
        system_instruction: str = VERIFICATION_SYSTEM_PROMPT,
    ) -> Tuple[SelfCritique, str, str]:
        """
        Pass 2: Multimodal inspection. Passes rasterized image back to Gemini.
        Returns (SelfCritique, final_answer, proof_summary).
        """
        logger.info("Executing Pass 2: Multimodal graph inspection and self-critique...")

        image_part = types.Part.from_bytes(data=png_bytes, mime_type="image/png")
        analysis_prompt = (
            f"ORIGINAL QUERY:\n{query}\n\n"
            f"PASS 1 INITIAL HYPOTHESIS:\n{scratchpad.initial_hypothesis}\n\n"
            f"PASS 1 TOPOLOGICAL OBSERVATIONS:\n"
            + "\n".join(f"- {obs}" for obs in scratchpad.topological_observations)
            + "\n\n"
            "MULTIMODAL INSTRUCTION:\n"
            "Examine the attached rasterized topological diagram (derived from your Pass 1 SVG). "
            "Inspect the 2D layout for:\n"
            "1. Causal Deadlocks or Unintended Closed Cycles.\n"
            "2. Inverted Edge Directionality or Premise Mismatches.\n"
            "3. Confounding paths or ungrounded claims.\n"
            "Provide your self-critique, verify or correct the initial hypothesis, and "
            "emit the final verified resolution in structured JSON."
        )

        # We configure structured output for Pass 2 verification
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[image_part, types.Part.from_text(text=analysis_prompt)],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "visual_anomalies_detected": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"},
                        },
                        "cycle_detected": {"type": "BOOLEAN"},
                        "discrepancy_analysis": {"type": "STRING"},
                        "confidence_score": {"type": "NUMBER"},
                        "proof_summary": {"type": "STRING"},
                        "final_answer": {"type": "STRING"},
                    },
                    "required": [
                        "visual_anomalies_detected",
                        "cycle_detected",
                        "discrepancy_analysis",
                        "confidence_score",
                        "proof_summary",
                        "final_answer",
                    ],
                },
                temperature=0.1,
            ),
        )

        raw_text = response.text or "{}"
        data = json.loads(raw_text)

        critique = SelfCritique(
            visual_anomalies_detected=data.get("visual_anomalies_detected", []),
            cycle_detected=data.get("cycle_detected", False),
            discrepancy_analysis=data.get("discrepancy_analysis", ""),
            confidence_score=float(data.get("confidence_score", 0.95)),
        )

        final_answer = data.get("final_answer", "")
        proof_summary = data.get("proof_summary", "")

        return critique, final_answer, proof_summary

    def solve(
        self,
        query: str,
        on_pass_1_complete: Optional[Callable[[VisualScratchpad], None]] = None,
        on_rasterize_complete: Optional[Callable[[bytes], None]] = None,
    ) -> VerifiedResolution:
        """
        Execute the full two-pass Visual-CoT verification cycle.

        Args:
            query: The natural language reasoning problem or puzzle.
            on_pass_1_complete: Optional callback invoked with Pass 1 VisualScratchpad.
            on_rasterize_complete: Optional callback invoked with rasterized PNG bytes.

        Returns:
            VerifiedResolution: The audited, verified final resolution.
        """
        start_time = time.perf_counter()

        # Step 1: Synthesize Topological Scratchpad
        scratchpad = self._execute_pass_1(query)
        if on_pass_1_complete:
            on_pass_1_complete(scratchpad)

        # Step 2: In-Memory Rasterization
        png_bytes = render_svg_to_png(scratchpad.latent_graph_svg)
        if on_rasterize_complete:
            on_rasterize_complete(png_bytes)

        # Step 3: Multimodal Inspection & Verification
        critique, final_answer, proof_summary = self._execute_pass_2(
            query=query,
            scratchpad=scratchpad,
            png_bytes=png_bytes,
        )

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return VerifiedResolution(
            final_answer=final_answer,
            proof_summary=proof_summary,
            self_critique=critique,
            execution_time_ms=elapsed_ms,
            raw_scratchpad=scratchpad,
        )


def run_visual_cot(
    query: str,
    api_key: Optional[str] = None,
    model: str = "gemini-2.5-flash",
) -> VerifiedResolution:
    """Convenience functional wrapper to run Visual-CoT on a single prompt."""
    harness = LatentCanvas(api_key=api_key, model_name=model)
    return harness.solve(query)
