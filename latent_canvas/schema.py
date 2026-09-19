"""
Pydantic V2 schemas for Latent Canvas Visual-CoT framework.

Defines structured outputs, topological node/edge metrics, visual scratchpad
representations, and verification results.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class NodeMetric(BaseModel):
    """Represents a discrete semantic vertex in the topological latent graph."""

    id: str = Field(
        ...,
        description="Unique identifier for the node (e.g. 'n_alice_truth', 'state_s1').",
    )
    label: str = Field(
        ...,
        description="Human-readable label displayed inside the node card.",
    )
    node_type: Literal[
        "entity",
        "condition",
        "bottleneck",
        "hypothesis",
        "conflict",
        "conclusion",
    ] = Field(
        default="entity",
        description="Semantic category of the node in the causal network.",
    )
    status: Literal["valid", "contradiction", "unresolved", "axiom"] = Field(
        default="unresolved",
        description="Epistemic status of the proposition or state.",
    )
    x: Optional[float] = Field(
        default=None,
        description="Projected X-coordinate on the 800x500 SVG canvas.",
    )
    y: Optional[float] = Field(
        default=None,
        description="Projected Y-coordinate on the 800x500 SVG canvas.",
    )


class EdgeMetric(BaseModel):
    """Represents a directed causal vector or dependency relation between nodes."""

    source_id: str = Field(
        ...,
        description="Source node ID originating the causal vector.",
    )
    target_id: str = Field(
        ...,
        description="Target node ID receiving the causal vector.",
    )
    relation_type: Literal[
        "causes",
        "depends_on",
        "inhibits",
        "implies",
        "conflicts_with",
    ] = Field(
        default="implies",
        description="Nature of the causal relationship.",
    )
    label: Optional[str] = Field(
        default=None,
        description="Descriptive annotation or conditional probability for the edge.",
    )
    is_cycle_participant: bool = Field(
        default=False,
        description="True if this edge contributes to a feedback loop or cycle.",
    )


class VisualScratchpad(BaseModel):
    """
    Structured output from Pass 1 of the Latent Canvas loop.
    Contains raw SVG geometry and initial topological analysis.
    """

    latent_graph_svg: str = Field(
        ...,
        description=(
            "Valid standalone SVG string (800x500 viewBox, dark-slate background, "
            "styled nodes and directed markers). Zero markdown wrappers."
        ),
    )
    topological_observations: List[str] = Field(
        ...,
        min_length=1,
        description=(
            "List of discrete findings extracted from graph topology "
            "(e.g., detected feedback loops, ungrounded premises, causal deadlocks)."
        ),
    )
    initial_hypothesis: str = Field(
        ...,
        min_length=5,
        description=(
            "Preliminary deduction synthesized from the geometric and causal layout "
            "prior to multimodal self-critique."
        ),
    )
    nodes: Optional[List[NodeMetric]] = Field(
        default_factory=list,
        description="Optional structured catalog of vertices parsed from the graph.",
    )
    edges: Optional[List[EdgeMetric]] = Field(
        default_factory=list,
        description="Optional structured catalog of directed edges parsed from the graph.",
    )

    @field_validator("latent_graph_svg")
    @classmethod
    def validate_svg_content(cls, v: str) -> str:
        """Ensure SVG is well-formed without markdown fences."""
        cleaned = v.strip()
        # Strip accidental markdown code blocks if present
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()

        if "<svg" not in cleaned:
            raise ValueError("latent_graph_svg must contain a root <svg> element.")
        if "</svg>" not in cleaned:
            raise ValueError("latent_graph_svg must contain a closing </svg> tag.")
        return cleaned


class SelfCritique(BaseModel):
    """Topological visual critique emitted during Pass 2 multimodal evaluation."""

    visual_anomalies_detected: List[str] = Field(
        default_factory=list,
        description="Discrepancies identified when visually auditing the 2D layout.",
    )
    cycle_detected: bool = Field(
        default=False,
        description="True if closed topological feedback or deadlock was verified.",
    )
    discrepancy_analysis: str = Field(
        ...,
        description=(
            "Detailed analysis reconciling the visual graph structure with the "
            "formal logical constraints."
        ),
    )
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Epistemic confidence in the verified resolution (0.0 to 1.0).",
    )


class VerifiedResolution(BaseModel):
    """
    Final verified solution produced by Pass 2 of the Latent Canvas pipeline.
    Combines the visual graph, self-critique, and rigorous proof.
    """

    final_answer: str = Field(
        ...,
        description="Definitive, unambiguous solution to the user's inquiry.",
    )
    proof_summary: str = Field(
        ...,
        description=(
            "Rigorous step-by-step proof grounding the answer in the visual topology "
            "and resolving all potential ambiguities."
        ),
    )
    self_critique: SelfCritique = Field(
        ...,
        description="Multimodal self-critique auditing the Pass 1 visual scratchpad.",
    )
    execution_time_ms: float = Field(
        default=0.0,
        description="Total end-to-end execution latency in milliseconds.",
    )
    raw_scratchpad: Optional[VisualScratchpad] = Field(
        default=None,
        description="The intermediate visual scratchpad that grounded this resolution.",
    )
