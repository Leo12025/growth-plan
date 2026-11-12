import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";
import type { ReportData } from "@/lib/report";
import { DEFAULT_REPORT_DATA } from "@/lib/report";

export async function GET() {
  const ctx = await requireOrg();
  if (!ctx) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const list = await db.report.findMany({
    where: { orgId: ctx.orgId },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ list });
}

export async function POST(req: NextRequest) {
  const ctx = await requireOrg();
  if (!ctx) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.studentId) {
    return NextResponse.json({ error: "请先选择学员" }, { status: 400 });
  }
  const student = await db.student.findUnique({ where: { id: b.studentId } });
  if (!student || student.orgId !== ctx.orgId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  const count = await db.report.count({ where: { orgId: ctx.orgId } });
  const report = await db.report.create({
    data: {
      orgId: ctx.orgId,
      studentId: b.studentId,
      no: `GP-${count + 1}`,
      title: `${student.name} 成长规划报告`,
      data: JSON.stringify((b.data as ReportData) ?? DEFAULT_REPORT_DATA),
    },
  });
  return NextResponse.json({ report });
}
