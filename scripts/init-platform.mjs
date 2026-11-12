/**
 * 初始化平台数据：管理员账号 + 默认套餐（幂等，可重复执行）
 * 用法：node scripts/init-platform.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const username = process.env.PLATFORM_ADMIN_USER || "admin";
  const password = process.env.PLATFORM_ADMIN_PASS || "admin888";

  const exists = await db.account.findUnique({ where: { username } });
  if (!exists) {
    await db.account.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(password, 10),
        role: "PLATFORM",
      },
    });
    console.log(`✓ 平台管理员已创建：${username} / ${password}`);
  } else {
    console.log(`· 平台管理员已存在：${username}`);
  }

  const plans = [
    { name: "日常版", price: 99, times: 200, validDays: 365 },
    { name: "机构版", price: 199, times: 500, validDays: 365 },
  ];
  for (const p of plans) {
    const found = await db.plan.findFirst({ where: { name: p.name } });
    if (!found) {
      await db.plan.create({ data: p });
      console.log(`✓ 套餐已创建：${p.name} ￥${p.price} / ${p.times} 次`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
