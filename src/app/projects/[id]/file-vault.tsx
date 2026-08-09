"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Trash2, Download, FolderOpen } from "lucide-react";
import { FILE_CATEGORIES, MAX_FILE_BYTES, formatBytes } from "@/lib/project-files";
import { formatDate } from "@/lib/utils";
import { uploadProjectFile, removeProjectFile } from "./files/actions";

export type VaultFile = {
  id: string;
  category: string;
  originalName: string;
  size: number;
  notes: string | null;
  createdAt: string;
};

export function FileVault({ projectId, files }: { projectId: string; files: VaultFile[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(FILE_CATEGORIES[0].key);
  const fileInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    startTransition(async () => {
      const result = await uploadProjectFile(projectId, fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
      setCategory(FILE_CATEGORIES[0].key);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-graphite-500" />
          <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500">Project files</h2>
        </div>
        <span className="text-xs text-graphite-400">
          {files.length} file{files.length === 1 ? "" : "s"} · max {formatBytes(MAX_FILE_BYTES)} each
        </span>
      </div>
      <p className="text-xs text-graphite-500 mb-4">
        Every project uses the same categories, so the structure is identical across productions.
      </p>

      <form ref={formRef} onSubmit={submit} className="rounded-lg border border-graphite-100 bg-graphite-50/40 p-3 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
          <div className="md:col-span-4">
            <label className="label">Category</label>
            <select
              name="category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {FILE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="label">File</label>
            <input ref={fileInput} type="file" name="file" className="text-xs w-full" />
          </div>
          <div className="md:col-span-3">
            <label className="label">Note (optional)</label>
            <input name="notes" className="input" />
          </div>
          <div className="md:col-span-1 flex md:justify-end">
            <button type="submit" className="btn-primary w-full md:w-auto" disabled={pending}>
              <Upload className="h-4 w-4" />
              <span className="md:hidden">Upload</span>
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </form>

      {files.length === 0 ? (
        <p className="text-sm text-graphite-500">No files yet.</p>
      ) : (
        <div className="space-y-4">
          {FILE_CATEGORIES.map((cat) => {
            const inCat = files.filter((f) => f.category === cat.key);
            if (inCat.length === 0) return null;
            return (
              <div key={cat.key}>
                <div className="text-xs uppercase tracking-wider text-graphite-400 mb-1">{cat.label}</div>
                <ul className="divide-y divide-graphite-100">
                  {inCat.map((f) => (
                    <li key={f.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={`/projects/${projectId}/files/${f.id}`}
                          className="font-medium hover:underline truncate block text-sm"
                        >
                          {f.originalName}
                        </a>
                        <div className="text-xs text-graphite-500 truncate">
                          {formatBytes(f.size)} · {formatDate(f.createdAt)}
                          {f.notes ? ` · ${f.notes}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`/projects/${projectId}/files/${f.id}`}
                          className="btn-ghost"
                          aria-label={`Download ${f.originalName}`}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          className="btn-ghost text-red-600 hover:bg-red-50"
                          disabled={pending}
                          onClick={() => {
                            if (!confirm(`Delete ${f.originalName}? This removes the file from disk.`)) return;
                            startTransition(async () => {
                              await removeProjectFile(f.id);
                            });
                          }}
                          aria-label={`Delete ${f.originalName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
