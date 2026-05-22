"""Command-line entry point for the local creative orchestrator.

    python -m supercomputer run "make a 3-image teaser for a coffee brand" -p coffee
    python -m supercomputer chat -p coffee
    python -m supercomputer projects
    python -m supercomputer assets -p coffee
"""

import argparse
import sys

from .agent import Orchestrator
from .backends import get_backend
from .projects import Project, list_projects


def _cmd_run(args):
    project = Project(args.project)
    backend = get_backend(args.backend)
    print(f"Project '{project.name}' | backend '{backend.name}' | dir {project.dir}")
    orch = Orchestrator(project, backend, model=args.model, max_iterations=args.max_iters)
    result = orch.run(args.goal)
    print(f"\n=== {result} ===")


def _cmd_chat(args):
    project = Project(args.project)
    backend = get_backend(args.backend)
    orch = Orchestrator(project, backend, model=args.model, max_iterations=args.max_iters)
    print(f"Project '{project.name}' | backend '{backend.name}'. Type a goal, or 'quit'.")
    while True:
        try:
            goal = input("\nGoal> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not goal:
            continue
        if goal.lower() in ("quit", "exit", "bye"):
            break
        print(f"\n=== {orch.run(goal)} ===")


def _cmd_projects(_args):
    names = list_projects()
    print("\n".join(names) if names else "No projects yet.")


def _cmd_assets(args):
    assets = Project(args.project).list_assets()
    if not assets:
        print("No assets yet.")
        return
    for a in assets:
        print(f"#{a['index']:>2} [{a['kind']}] {a['file']} — {a['prompt'][:60]}")


def main(argv=None):
    parser = argparse.ArgumentParser(prog="supercomputer",
                                     description="Local agentic creative orchestrator.")
    sub = parser.add_subparsers(dest="command", required=True)

    def add_common(p, needs_project=True):
        if needs_project:
            p.add_argument("-p", "--project", default="default", help="Project name.")
        p.add_argument("--backend", default=None,
                       help="stub (default), openai, gemini, higgsfield, or http.")
        p.add_argument("--model", default="claude-opus-4-7")
        p.add_argument("--max-iters", dest="max_iters", type=int, default=25)

    p_run = sub.add_parser("run", help="Run the agent toward a goal once.")
    p_run.add_argument("goal")
    add_common(p_run)
    p_run.set_defaults(func=_cmd_run)

    p_chat = sub.add_parser("chat", help="Interactive multi-goal session.")
    add_common(p_chat)
    p_chat.set_defaults(func=_cmd_chat)

    p_proj = sub.add_parser("projects", help="List all projects.")
    p_proj.set_defaults(func=_cmd_projects)

    p_assets = sub.add_parser("assets", help="List a project's assets.")
    p_assets.add_argument("-p", "--project", default="default")
    p_assets.set_defaults(func=_cmd_assets)

    args = parser.parse_args(argv)
    args.func(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
