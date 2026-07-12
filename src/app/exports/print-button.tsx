"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print text-sm rounded-md bg-accent text-accent-foreground px-3 py-1.5 font-medium hover:opacity-90"
    >
      Als PDF drucken
    </button>
  );
}
