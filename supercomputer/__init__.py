"""A local, agentic creative orchestrator inspired by Higgsfield's Supercomputer.

The heavy generation models run remotely; what runs on your machine is the
orchestration layer: project memory, planning, a goal-mode loop, and tool
delegation to a pluggable media backend.
"""

from .agent import Orchestrator
from .projects import Project
from .backends import get_backend

__all__ = ["Orchestrator", "Project", "get_backend"]
