"""The orchestration layer: a Claude-driven plan -> act -> review loop.

This is the local analogue of Higgsfield's Supercomputer agent. It does not
generate media itself; it plans, calls tools, inspects the results, and keeps
iterating until the goal is marked complete or it needs the user.
"""

from .tools import TOOLS, dispatch

SYSTEM_PROMPT = """\
You are a local creative orchestration agent, a self-hosted equivalent of \
Higgsfield's Supercomputer. You turn a high-level creative goal into finished \
assets by planning and delegating to media-generation tools.

Operate in goal mode: plan -> act -> review, looping until the goal is met.

Rules:
- Call set_plan first with concrete, ordered steps. Update it if the plan changes.
- Use generate_image / generate_video to produce assets. Pick sensible prompts,
  filenames, aspect ratios and styles yourself; do not ask the user for details
  you can reasonably decide.
- After each generation, briefly review whether it advances the plan, then
  continue to the next step.
- Use list_assets to reference earlier work when the user says things like
  "another like the third one".
- Use save_note to persist decisions or briefs worth remembering across sessions.
- When every step is done and the goal is fully met, call mark_goal_complete
  with a short summary. Only stop without completing if you genuinely need a
  decision from the user.
"""


class Orchestrator:
    def __init__(self, project, backend, model: str = "claude-opus-4-7",
                 max_iterations: int = 25, verbose: bool = True, client=None):
        self.project = project
        self.backend = backend
        self.model = model
        self.max_iterations = max_iterations
        self.verbose = verbose
        if client is None:
            import anthropic  # lazy so the rest of the package works without the SDK
            client = anthropic.Anthropic()
        self.client = client

    def _log(self, *a):
        if self.verbose:
            print(*a, flush=True)

    def run(self, goal: str) -> str:
        messages = self.project.load_memory()
        messages.append({"role": "user", "content": goal})

        for _ in range(self.max_iterations):
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=SYSTEM_PROMPT,
                tools=TOOLS,
                messages=messages,
            )
            # Store content as plain dicts so memory stays JSON-serialisable.
            messages.append({"role": "assistant", "content": [_dump(b) for b in response.content]})

            for block in response.content:
                if block.type == "text" and block.text.strip():
                    self._log(f"\n[agent] {block.text.strip()}")

            if response.stop_reason != "tool_use":
                self.project.save_memory(messages)
                return self._final_text(response)

            tool_results = []
            goal_done = False
            for block in response.content:
                if block.type != "tool_use":
                    continue
                self._log(f"[tool] {block.name}({_brief(block.input)})")
                try:
                    result, done = dispatch(block.name, block.input, self.project, self.backend)
                    is_error = False
                except Exception as e:  # surface the failure to the agent, keep memory valid
                    result, done, is_error = f"Tool error: {e}", False, True
                self._log(f"       -> {result.splitlines()[0] if result else ''}")
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                    "is_error": is_error,
                })
                goal_done = goal_done or done

            messages.append({"role": "user", "content": tool_results})
            self.project.save_memory(messages)

            if goal_done:
                return "Goal complete."

        self.project.save_memory(messages)
        return f"Stopped after {self.max_iterations} iterations without completion."

    @staticmethod
    def _final_text(response) -> str:
        return "".join(b.text for b in response.content if b.type == "text").strip() \
            or "(no further output)"


def _dump(block):
    """SDK content block -> JSON-serialisable dict (already-dict blocks pass through)."""
    if hasattr(block, "model_dump"):
        return block.model_dump()
    return block


def _brief(d: dict, limit: int = 60) -> str:
    s = ", ".join(f"{k}={v!r}" for k, v in d.items())
    return s if len(s) <= limit else s[:limit] + "..."
