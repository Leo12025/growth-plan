"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const TABS = [
  { key: "brand", label: "品牌与校区" },
  { key: "teachers", label: "老师团队" },
  { key: "courses", label: "课程体系" },
  { key: "tags", label: "学员标签" },
  { key: "keywords", label: "表现关键词" },
  { key: "contests", label: "赛事考级" },
  { key: "comments", label: "评语模板" },
  { key: "schedules", label: "机构赛事日程" },
  { key: "achievements", label: "学习成果库" },
  { key: "quota", label: "套餐与兑换" },
];

export default function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="w-44 shrink-0 space-y-1">
      {TABS.map((t) => {
        const active = pathname === `/settings/${t.key}`;
        return (
          <Link
            key={t.key}
            href={`/settings/${t.key}`}
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              active
                ? "bg-indigo-600 text-white font-medium"
                : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
