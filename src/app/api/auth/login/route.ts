import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createToken, sessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = (await req.json().catch(() => ({}))) ?? {};
  if (!username || !password) {
    return NextResponse.json({ error: "请输入账号和密码" }, { status: 400 });
  }
  const account = await db.account.findUnique({ where: { username } });
  if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }
  const token = createToken({
    accountId: account.id,
    role: account.role === "PLATFORM" ? "PLATFORM" : "ORG",
    orgId: account.orgId ?? undefined,
  });
  const res = NextResponse.json({
    ok: true,
    role: account.role,
    orgId: account.orgId,
  });
  res.cookies.set(sessionCookie.name, token, {
    httpOnly: true,
    maxAge: sessionCookie.maxAge,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
