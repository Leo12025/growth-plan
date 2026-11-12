import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createToken, sessionCookie } from "@/lib/auth";
import { seedOrgData } from "@/lib/seed";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { username, password, orgName, address, phone } = body ?? {};
  if (!username || !password || !orgName) {
    return NextResponse.json(
      { error: "请填写账号、密码和机构名称" },
      { status: 400 }
    );
  }
  if (String(password).length < 6) {
    return NextResponse.json(
      { error: "密码至少 6 位" },
      { status: 400 }
    );
  }

  const exists = await db.account.findUnique({ where: { username } });
  if (exists) {
    return NextResponse.json({ error: "该账号已被注册" }, { status: 400 });
  }

  const org = await db.org.create({
    data: { name: orgName, address: address ?? "", phone: phone ?? "" },
  });
  const account = await db.account.create({
    data: {
      username,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ORG",
      orgId: org.id,
    },
  });

  // 预置数据 + 体验次数（10 次）
  await seedOrgData(org.id);
  await db.quotaAccount.create({ data: { orgId: org.id, balance: 10 } });
  await db.quotaLog.create({
    data: { orgId: org.id, delta: 10, reason: "注册赠送" },
  });

  const token = createToken({
    accountId: account.id,
    role: "ORG",
    orgId: org.id,
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, token, {
    httpOnly: true,
    maxAge: sessionCookie.maxAge,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
