"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReportRowActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("删除该报告？删除后不可恢复。")) return;
    setBusy(true);
    const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("删除失败");
  }

  return (
    <div className="flex items-center gap-4 shrink-0">
      <Link
        href={`/reports/${reportId}/edit`}
        className="text-sm text-indigo-600 hover:underline"
      >
        编辑
      </Link>
      <Link
        href={`/print/reports/${reportId}`}
        target="_blank"
        className="text-sm text-slate-500 hover:underline"
      >
        预览
      </Link>
      <button
        onClick={remove}
        disabled={busy}
        className="text-sm text-red-500 hover:underline disabled:opacity-50"
      >
        删除
      </button>
    </div>
  );
}
