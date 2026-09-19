"""
Latent Canvas: Visual Chain-of-Thought (Visual-CoT) Framework.

A developer framework and multimodal harness where LLMs construct intermediate
topological graphs rendered as raw SVG, rasterize them, and inspect them via
multimodal feedback for self-critique and verification.
"""

from latent_canvas.schema import (
    VisualScratchpad,
    NodeMetric,
    EdgeMetric,
    SelfCritique,
    VerifiedResolution,
)
from latent_canvas.renderer import render_svg_to_png
from latent_canvas.core import LatentCanvas, run_visual_cot
from latent_canvas.prompts import LATENT_CANVAS_SYSTEM_PROMPT

__version__ = "0.1.0"
__all__ = [
    "LatentCanvas",
    "VisualScratchpad",
    "NodeMetric",
    "EdgeMetric",
    "SelfCritique",
    "VerifiedResolution",
    "render_svg_to_png",
    "run_visual_cot",
    "LATENT_CANVAS_SYSTEM_PROMPT",
]
