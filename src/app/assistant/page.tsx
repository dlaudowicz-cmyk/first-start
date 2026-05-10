import { PageHeader } from "@/components/page-header";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import { AssistantWorkspace } from "./assistant-workspace";

export default function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="Structured prompt templates — paste your notes, copy the rendered prompt to your model of choice. API integration is intentionally not wired yet (see TODO in README)."
      />
      <AssistantWorkspace
        templates={PROMPT_TEMPLATES.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          inputLabel: t.inputLabel,
          inputPlaceholder: t.inputPlaceholder,
        }))}
      />
    </>
  );
}
