"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print text-sm btn-primary"
    >
      Als PDF drucken
    </button>
  );
}
