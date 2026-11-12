"use client";

import { useRef, useState } from "react";

async function uploadFile(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    alert(d.error || "上传失败");
    return null;
  }
  const d = await res.json();
  return d.url as string;
}

/** 单图上传（头像 / Logo） */
export function ImageUpload({
  value,
  onChange,
  label,
  shape = "square",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  shape?: "square" | "circle";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-xs text-slate-500 mb-1">{label}</label>
      )}
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="preview"
            className={`w-16 h-16 object-cover border border-slate-200 ${
              shape === "circle" ? "rounded-full" : "rounded-lg"
            }`}
          />
        ) : (
          <div
            className={`w-16 h-16 bg-slate-100 text-slate-400 flex items-center justify-center text-xs border border-dashed border-slate-300 ${
              shape === "circle" ? "rounded-full" : "rounded-lg"
            }`}
          >
            无图
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 hover:border-indigo-400 disabled:opacity-60"
          >
            {busy ? "上传中…" : "上传图片"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              移除
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            const url = await uploadFile(f);
            setBusy(false);
            if (url) onChange(url);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

/** 多图上传（学员照片，最多 6 张） */
export function PhotoUpload({
  value,
  onChange,
  max = 6,
  label,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-xs text-slate-500 mb-1">{label}</label>
      )}
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`photo-${i}`}
              className="w-20 h-20 object-cover rounded-lg border border-slate-200"
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-700 text-white text-xs leading-5"
            >
              ×
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="w-20 h-20 rounded-lg border border-dashed border-slate-300 text-slate-400 text-xs hover:border-indigo-400 disabled:opacity-60"
          >
            {busy ? "上传中…" : "+ 添加"}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length === 0) return;
            setBusy(true);
            const urls: string[] = [];
            for (const f of files.slice(0, max - value.length)) {
              const u = await uploadFile(f);
              if (u) urls.push(u);
            }
            setBusy(false);
            onChange([...value, ...urls]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
