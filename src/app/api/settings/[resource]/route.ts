import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";

type ResourceConfig = {
  model: keyof PrismaClient;
  fields: string[];
  orderBy: Prisma.CourseOrderByWithRelationInput | Record<string, string>;
};

export const RESOURCES: Record<string, ResourceConfig> = {
  campuses: { model: "campus", fields: ["name"], orderBy: { createdAt: "asc" } },
  teachers: {
    model: "teacher",
    fields: ["name", "title"],
    orderBy: { createdAt: "asc" },
  },
  courses: {
    model: "course",
    fields: ["name", "intro", "isCustom", "sortOrder"],
    orderBy: { sortOrder: "asc" },
  },
  tags: { model: "studentTag", fields: ["name"], orderBy: { createdAt: "asc" } },
  groups: {
    model: "keywordGroup",
    fields: ["name", "sortOrder"],
    orderBy: { sortOrder: "asc" },
  },
  keywords: {
    model: "keyword",
    fields: ["content", "groupId"],
    orderBy: { createdAt: "asc" },
  },
  contests: {
    model: "contest",
    fields: ["name", "type", "intro"],
    orderBy: { createdAt: "asc" },
  },
  comments: {
    model: "commentTemplate",
    fields: ["title", "category", "content"],
    orderBy: { createdAt: "asc" },
  },
  achievements: {
    model: "achievementPreset",
    fields: ["name", "type"],
    orderBy: { createdAt: "asc" },
  },
  schedules: {
    model: "contestSchedule",
    fields: ["name", "date", "location", "signupAt", "contestId"],
    orderBy: { createdAt: "asc" },
  },
};

function pick(data: Record<string, unknown>, fields: string[]) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (data[f] !== undefined) out[f] = data[f];
  }
  return out;
}

type RouteContext = { params: Promise<{ resource: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const account = await requireOrg();
  if (!account) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { resource } = await ctx.params;
  const conf = RESOURCES[resource];
  if (!conf) return NextResponse.json({ error: "未知资源" }, { status: 404 });
  const delegate = db[conf.model] as PrismaClient["course"];
  const list = await delegate.findMany({
    where: { orgId: account.orgId },
    orderBy: conf.orderBy as never,
  });
  return NextResponse.json({ list });
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const account = await requireOrg();
  if (!account) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { resource } = await ctx.params;
  const conf = RESOURCES[resource];
  if (!conf) return NextResponse.json({ error: "未知资源" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const data = pick(body, conf.fields);
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "缺少字段" }, { status: 400 });
  }
  const delegate = db[conf.model] as PrismaClient["course"];
  const item = await delegate.create({
    data: ({ ...data, orgId: account.orgId }) as never,
  });
  return NextResponse.json({ item });
}
