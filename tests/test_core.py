"""
Unit and integration tests for Latent Canvas.
"""

import unittest
from unittest.mock import MagicMock, patch

try:
    import pydantic
    from latent_canvas.prompts import LATENT_CANVAS_SYSTEM_PROMPT
    from latent_canvas.renderer import render_svg_to_png
    from latent_canvas.schema import (
        EdgeMetric,
        NodeMetric,
        SelfCritique,
        VerifiedResolution,
        VisualScratchpad,
    )
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False

SAMPLE_VALID_SVG = """<svg viewBox="0 0 800 500" width="800" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#0f172a" rx="12"/>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"/>
    </marker>
  </defs>
  <rect x="100" y="200" width="140" height="50" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="170" y="230" fill="#f8fafc" font-size="12" text-anchor="middle">Premise A</text>
  <rect x="400" y="200" width="140" height="50" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="470" y="230" fill="#f8fafc" font-size="12" text-anchor="middle">Conclusion B</text>
  <path d="M 240 225 L 390 225" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
</svg>"""


@unittest.skipUnless(HAS_DEPS, "Full dependencies (pydantic, etc.) required for schema tests")
class TestLatentCanvasSchemas(unittest.TestCase):
    """Test Pydantic schemas and topological validation."""

    def test_visual_scratchpad_valid(self):
        scratchpad = VisualScratchpad(
            latent_graph_svg=SAMPLE_VALID_SVG,
            topological_observations=[
                "Linear path verified from Premise A to Conclusion B.",
                "Zero feedback loops or cyclic deadlocks found.",
            ],
            initial_hypothesis="Premise A unconditionally forces Conclusion B.",
            nodes=[
                NodeMetric(id="node_a", label="Premise A", node_type="condition"),
                NodeMetric(id="node_b", label="Conclusion B", node_type="conclusion"),
            ],
            edges=[
                EdgeMetric(source_id="node_a", target_id="node_b", relation_type="implies"),
            ],
        )
        self.assertIn("<svg", scratchpad.latent_graph_svg)
        self.assertEqual(len(scratchpad.topological_observations), 2)
        self.assertEqual(scratchpad.nodes[0].id, "node_a")

    def test_svg_markdown_strip_validator(self):
        wrapped_svg = f"```xml\n{SAMPLE_VALID_SVG}\n```"
        scratchpad = VisualScratchpad(
            latent_graph_svg=wrapped_svg,
            topological_observations=["Cleaned properly."],
            initial_hypothesis="Markdown fences stripped cleanly.",
        )
        self.assertFalse(scratchpad.latent_graph_svg.startswith("```"))
        self.assertTrue(scratchpad.latent_graph_svg.startswith("<svg"))

    def test_verified_resolution_structure(self):
        critique = SelfCritique(
            visual_anomalies_detected=[],
            cycle_detected=False,
            discrepancy_analysis="Visual diagram confirms acyclic DAG.",
            confidence_score=0.99,
        )
        res = VerifiedResolution(
            final_answer="Conclusion B holds true.",
            proof_summary="By modus ponens across path A -> B.",
            self_critique=critique,
            execution_time_ms=124.5,
        )
        self.assertEqual(res.final_answer, "Conclusion B holds true.")
        self.assertEqual(res.self_critique.confidence_score, 0.99)


@unittest.skipUnless(HAS_DEPS, "Full dependencies required for renderer tests")
class TestRenderer(unittest.TestCase):
    """Test SVG to PNG in-memory conversion."""

    def test_render_svg_to_png_bytes(self):
        png_bytes = render_svg_to_png(SAMPLE_VALID_SVG)
        self.assertIsInstance(png_bytes, bytes)
        self.assertGreater(len(png_bytes), 32)
        # Verify PNG magic header: \x89PNG\r\n\x1a\n
        self.assertTrue(png_bytes.startswith(b"\x89PNG\r\n\x1a\n"))

    def test_render_fallback_resilience(self):
        # Even on stripped or malformed SVG, the fallback generates valid PNG bytes
        fallback_bytes = render_svg_to_png("<svg><text>Fault Tolerant</text></svg>")
        self.assertIsInstance(fallback_bytes, bytes)
        self.assertTrue(fallback_bytes.startswith(b"\x89PNG"))


@unittest.skipUnless(HAS_DEPS, "Full dependencies required for harness tests")
class TestCoreHarness(unittest.TestCase):
    """Test core two-pass orchestration with mocked GenAI backend."""

    @patch("latent_canvas.core.genai.Client")
    def test_two_pass_mock_execution(self, mock_client_cls):
        from latent_canvas.core import LatentCanvas

        # Setup mock client
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        # Mock Pass 1 response
        mock_pass1_resp = MagicMock()
        mock_pass1_resp.text = f"""{{
            "latent_graph_svg": "{SAMPLE_VALID_SVG.replace(chr(10), ' ')}",
            "topological_observations": ["Single edge detected"],
            "initial_hypothesis": "A implies B"
        }}"""

        # Mock Pass 2 response
        mock_pass2_resp = MagicMock()
        mock_pass2_resp.text = """{
            "visual_anomalies_detected": [],
            "cycle_detected": false,
            "discrepancy_analysis": "Graph matches expected topology.",
            "confidence_score": 0.98,
            "proof_summary": "Topologically verified direct causality.",
            "final_answer": "Verified solution."
        }"""

        mock_client.models.generate_content.side_effect = [
            mock_pass1_resp,
            mock_pass2_resp,
        ]

        harness = LatentCanvas(api_key="mock-key-for-tests")
        result = harness.solve("Test question")

        self.assertEqual(result.final_answer, "Verified solution.")
        self.assertEqual(result.self_critique.confidence_score, 0.98)
        self.assertEqual(mock_client.models.generate_content.call_count, 2)


if __name__ == "__main__":
    unittest.main()
