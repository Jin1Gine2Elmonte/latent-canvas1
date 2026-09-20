"""
Command Line Interface for Latent Canvas.
Built with Typer and Rich to provide an elegant, research-grade terminal experience.
"""

import os
import sys
import time
from pathlib import Path
from typing import Optional

import typer
from rich import box
from rich.console import Console
from rich.panel import Panel
from rich.syntax import Syntax
from rich.table import Table

from latent_canvas import __version__
from latent_canvas.core import LatentCanvas
from latent_canvas.prompts import LATENT_CANVAS_SYSTEM_PROMPT
from latent_canvas.renderer import render_svg_to_png, save_png
from latent_canvas.schema import SelfCritique, VisualScratchpad

app = typer.Typer(
    name="latent-canvas",
    help="Latent Canvas: Visual Chain-of-Thought (Visual-CoT) Terminal Harness.",
    add_completion=False,
)

console = Console()

BANNER = r"""[bold cyan]
   _            _             _      ____                                   
  | |    __ _  | |_  ___ _ __ | |_   / ___|__ _ _ ____   ____ _ ___         
  | |   / _` | | __|/ _ \ '_ \| __| | |   / _` | '_ \ \ / / _` / __|        
  | |__| (_| | | |_|  __/ | | | |_  | |__| (_| | | | \ V / (_| \__ \        
  |_____\__,_|  \__|\___|_| |_|\__|  \____\__,_|_| |_|\_/ \__,_|___/       
[/][dim]  Visual Chain-of-Thought (Visual-CoT) Multimodal Reasoning Engine  [/]
"""

DEMO_SVG = """<svg viewBox="0 0 800 500" width="800" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#0f172a" rx="12"/>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"/></marker>
    <marker id="arrow-conflict" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171"/></marker>
  </defs>
  <rect x="30" y="25" width="310" height="36" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
  <text x="45" y="48" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">LATENT CANVAS // OFFLINE DEMO HARNESS</text>
  <rect x="80" y="160" width="160" height="60" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="160" y="195" fill="#f8fafc" font-size="14" font-weight="600" text-anchor="middle">Agent A (Honest)</text>
  <rect x="340" y="160" width="160" height="60" rx="10" fill="#1e293b" stroke="#f87171" stroke-width="2"/>
  <text x="420" y="195" fill="#f8fafc" font-size="14" font-weight="600" text-anchor="middle">Agent B (Compromised)</text>
  <rect x="580" y="160" width="160" height="60" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="660" y="195" fill="#f8fafc" font-size="14" font-weight="600" text-anchor="middle">Agent C (Honest)</text>
  <path d="M 240 190 L 330 190" stroke="#f87171" stroke-width="2" marker-end="url(#arrow-conflict)"/>
  <path d="M 500 190 L 570 190" stroke="#f87171" stroke-width="2" marker-end="url(#arrow-conflict)"/>
</svg>"""

@app.callback(invoke_without_command=True)
def default_callback(ctx: typer.Context) -> None:
    if ctx.invoked_subcommand is None:
        console.print(BANNER)
        console.print(
            "[yellow]Run [bold]latent-canvas --help[/bold] to see available commands.[/]\n"
            "Try: [cyan]latent-canvas run --demo[/cyan] or [cyan]latent-canvas benchmark[/cyan]"
        )

@app.command()
def run(
    query: Optional[str] = typer.Argument(None, help="The logic, causality, or state problem to solve."),
    file: Optional[str] = typer.Option(None, "--file", "-f", help="Path to text file containing the query prompt."),
    model: str = typer.Option("gemini-2.5-flash", "--model", "-m", help="Gemini model identifier to use."),
    demo: bool = typer.Option(False, "--demo", "-d", help="Run deterministic offline demo without requiring GEMINI_API_KEY."),
    output_svg: Optional[str] = typer.Option(None, "--output-svg", "-s", help="Save Pass 1 raw SVG graph to this file."),
    output_png: Optional[str] = typer.Option(None, "--output-png", "-p", help="Save rasterized graph PNG to this file."),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Print raw SVG XML and detailed metrics."),
) -> None:
    """Execute the full two-pass Visual-CoT reasoning cycle."""
    console.print(BANNER)

    resolved_query = "Four agents (A, B, C, D) report on a cluster: A says 'B is compromised'. B says 'C is compromised'. C says 'A and D share identical status'. D says 'A is honest'. Determine truth values."
    if file:
        if not os.path.exists(file):
            console.print(f"[bold red]Error:[/] File not found: {file}")
            raise typer.Exit(code=1)
        with open(file, "r", encoding="utf-8") as f:
            resolved_query = f.read().strip()
    elif query:
        resolved_query = query.strip()
    elif not demo:
        console.print("[bold red]Error:[/] You must provide a query argument, --file, or pass --demo.")
        raise typer.Exit(code=1)

    console.print(Panel(f"[bold white]{resolved_query}[/]", title="[bold cyan]Input Problem[/]", border_style="cyan", box=box.ROUNDED))

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key and not demo:
        console.print(
            "[bold yellow]Warning:[/] GEMINI_API_KEY is not set. Switching automatically to deterministic [bold cyan]--demo mode[/bold cyan].\n"
            "To use live Gemini execution: [cyan]export GEMINI_API_KEY='your-key'[/cyan]"
        )
        demo = True

    try:
        if demo:
            with console.status("[bold cyan]Demo Mode: Generating 2D topological SVG graph...[/]", spinner="dots"):
                time.sleep(0.4)
                scratchpad = VisualScratchpad(
                    latent_graph_svg=DEMO_SVG,
                    topological_observations=[
                        "Closed parity cycle identified across vertices A, B, C, D.",
                        "Negative edge signs: (A->B) = -1, (B->C) = -1.",
                        "Cycle sign product = (-1)*(-1)*(+1) = +1, proving consistent resolution exists.",
                    ],
                    initial_hypothesis="Agent B is compromised. Agents A, C, and D are truthful.",
                )
            console.print("[green]✓ Pass 1 Complete:[/] Synthesized topological graph.")
        else:
            harness = LatentCanvas(api_key=api_key, model_name=model)
            with console.status("[bold cyan]Pass 1: Deconstructing problem into 2D topological SVG graph...[/]", spinner="dots"):
                scratchpad = harness._execute_pass_1(resolved_query)
            console.print("[green]✓ Pass 1 Complete:[/] Synthesized topological graph.")

        # Display findings
        obs_table = Table(title="Pass 1 Topological Findings", box=box.SIMPLE_HEAVY, header_style="bold cyan")
        obs_table.add_column("#", style="dim", width=4)
        obs_table.add_column("Observation", style="white")
        for i, obs in enumerate(scratchpad.topological_observations, start=1):
            obs_table.add_row(str(i), obs)
        console.print(obs_table)

        console.print(Panel(f"[italic]{scratchpad.initial_hypothesis}[/]", title="[bold yellow]Pass 1 Initial Hypothesis[/]", border_style="yellow", box=box.ROUNDED))

        if verbose:
            console.print("\n[dim]Raw SVG Snippet:[/]")
            console.print(Syntax(scratchpad.latent_graph_svg[:1200] + "\n...", "xml", theme="monokai", line_numbers=True))

        # Rasterization
        with console.status("[bold magenta]Rasterizing SVG -> PNG in-memory for Multimodal Feed...[/]", spinner="bouncingBar"):
            rasterized_png = render_svg_to_png(scratchpad.latent_graph_svg)
        console.print(f"[green]✓ Rasterization Complete:[/] {len(rasterized_png):,} bytes PNG generated.")

        if output_svg:
            with open(output_svg, "w", encoding="utf-8") as f:
                f.write(scratchpad.latent_graph_svg)
            console.print(f"[dim]Saved SVG to: {output_svg}[/]")
        if output_png:
            save_png(rasterized_png, output_png)
            console.print(f"[dim]Saved PNG to: {output_png}[/]")

        # Pass 2: Critique
        if demo:
            with console.status("[bold cyan]Demo Mode: Multimodal self-critique & verified synthesis...[/]", spinner="dots"):
                time.sleep(0.5)
                critique = SelfCritique(
                    visual_anomalies_detected=[],
                    cycle_detected=True,
                    discrepancy_analysis="Visual inspection confirms positive parity loop (+1). Inverse hypothesis A=0 collapses under topological feedback.",
                    confidence_score=0.99,
                )
                final_answer = "Agent B is the only compromised agent. Agents A, C, and D are truthful."
                proof_summary = "Cycle parity product is positive (+1). Evaluating ~A branch requires D to assert A=1 while D is honest, collapsing inverted branch."
                duration_ms = 142.0
            console.print("[green]✓ Pass 2 Complete:[/] Multimodal self-critique reconciled.")
        else:
            with console.status("[bold cyan]Pass 2: Multimodal self-critique & verified synthesis...[/]", spinner="dots"):
                start_t = time.perf_counter()
                critique, final_answer, proof_summary = harness._execute_pass_2(
                    query=resolved_query,
                    scratchpad=scratchpad,
                    png_bytes=rasterized_png,
                )
                duration_ms = (time.perf_counter() - start_t) * 1000.0
            console.print("[green]✓ Pass 2 Complete:[/] Multimodal self-critique reconciled.")

        critique_text = f"[bold]Discrepancy Analysis:[/] {critique.discrepancy_analysis}\n"
        critique_text += f"[bold]Cycle Detected:[/] {'Yes (Deadlock/Recurrence)' if critique.cycle_detected else 'No (Acyclic DAG)'}\n"
        critique_text += f"[bold]Confidence Score:[/] {critique.confidence_score * 100:.1f}%\n"
        console.print(Panel(critique_text, title="[bold purple]Pass 2 Multimodal Self-Critique[/]", border_style="purple", box=box.ROUNDED))

        solution_content = (
            f"[bold green]VERIFIED ANSWER:[/]\n{final_answer}\n\n"
            f"[bold white]RIGOROUS PROOF SUMMARY:[/]\n{proof_summary}\n\n"
            f"[dim]Total verification latency: {duration_ms:.1f}ms[/]"
        )
        console.print(Panel(solution_content, title="[bold green]Final Verified Resolution[/]", border_style="green", box=box.DOUBLE))

    except Exception as exc:
        console.print(f"\n[bold red]Execution Error:[/] {exc}")
        if verbose:
            console.print_exception()
        raise typer.Exit(code=1)

@app.command()
def benchmark(
    mock: bool = typer.Option(True, "--mock/--live", help="Run benchmark in simulated or live mode."),
    model: str = typer.Option("gemini-2.5-flash", "--model", help="Gemini model identifier for live benchmarks."),
) -> None:
    """Run the standardized Visual-CoT evaluation benchmark suite."""
    repo_root = Path(__file__).resolve().parent.parent
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))
    from benchmarks.evaluate import run_evaluation
    run_evaluation(mock_mode=mock, model=model)

@app.command()
def inspect_prompt() -> None:
    """Display the core production-grade system instruction."""
    console.print(BANNER)
    console.print(Panel(Syntax(LATENT_CANVAS_SYSTEM_PROMPT, "markdown", theme="monokai", line_numbers=True), title="[bold cyan]Latent Canvas Core System Prompt[/]", border_style="cyan", box=box.ROUNDED))

@app.command()
def version() -> None:
    """Print package version and environment info."""
    console.print(BANNER)
    console.print(f"[bold cyan]Latent Canvas Engine:[/] v{__version__}")
    console.print(f"[bold cyan]Python Runtime:[/] {sys.version.split()[0]}")
    console.print("[bold cyan]Supported Backends:[/] Google GenAI SDK (Gemini 2.5/3.0+)")

def main() -> None:
    app()

if __name__ == "__main__":
    main()
