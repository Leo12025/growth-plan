import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requirePlatform } from "@/lib/auth";
import { seedOrgData } from "@/lib/seed";

export async function GET() {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const orgs = await db.org.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      account: { select: { username: true } },
      quota: true,
      _count: { select: { reports: true, students: true } },
    },
  });
  return NextResponse.json({ list: orgs });
}

/** 平台新建机构（可选，机构也可自助注册） */
export async function POST(req: NextRequest) {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.name || !b.username || !b.password)
    return NextResponse.json({ error: "缺少必填项" }, { status: 400 });
  const exists = await db.account.findUnique({
    where: { username: String(b.username) },
  });
  if (exists) return NextResponse.json({ error: "账号已存在" }, { status: 400 });

  const org = await db.org.create({
    data: {
      name: String(b.name),
      address: String(b.address ?? ""),
      phone: String(b.phone ?? ""),
    },
  });
  await db.account.create({
    data: {
      username: String(b.username),
      passwordHash: await bcrypt.hash(String(b.password), 10),
      role: "ORG",
      orgId: org.id,
    },
  });
  await seedOrgData(org.id);
  const init = Number(b.initQuota ?? 0);
  await db.quotaAccount.create({
    data: { orgId: org.id, balance: init },
  });
  if (init > 0) {
    await db.quotaLog.create({
      data: { orgId: org.id, delta: init, reason: "平台开通赠送" },
    });
  }
  return NextResponse.json({ org });
}
