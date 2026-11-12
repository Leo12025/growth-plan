import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE_NAME = "gp_session";
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 天

export type SessionPayload = {
  accountId: string;
  role: "ORG" | "PLATFORM";
  orgId?: string;
  exp: number;
};

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function createToken(payload: Omit<SessionPayload, "exp">) {
  const data: SessionPayload = {
    ...payload,
    exp: Date.now() + MAX_AGE * 1000,
  };
  const body = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (sign(body) !== sig) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

/** 服务端组件/接口用：要求机构登录，返回机构上下文 */
export async function requireOrg() {
  const session = await getSession();
  if (!session || session.role !== "ORG" || !session.orgId) return null;
  const account = await db.account.findUnique({
    where: { id: session.accountId },
    include: { org: true },
  });
  if (!account || !account.org) return null;
  return { account, org: account.org, orgId: account.org.id };
}

/** 服务端组件/接口用：要求平台管理员登录 */
export async function requirePlatform() {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM") return null;
  const account = await db.account.findUnique({
    where: { id: session.accountId },
  });
  if (!account || account.role !== "PLATFORM") return null;
  return account;
}

export const sessionCookie = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE,
};
