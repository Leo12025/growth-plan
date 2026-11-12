import { requireOrg } from "@/lib/auth";
import { db } from "@/lib/db";
import StudentManager from "@/components/StudentManager";

export default async function StudentsPage() {
  const ctx = await requireOrg();
  if (!ctx) return null;
  const [campuses, teachers, tags] = await Promise.all([
    db.campus.findMany({ where: { orgId: ctx.orgId } }),
    db.teacher.findMany({ where: { orgId: ctx.orgId } }),
    db.studentTag.findMany({ where: { orgId: ctx.orgId } }),
  ]);
  return (
    <StudentManager
      campuses={campuses.map((c) => ({ id: c.id, name: c.name }))}
      teachers={teachers.map((t) => ({ id: t.id, name: t.name }))}
      tags={tags.map((t) => ({ id: t.id, name: t.name }))}
    />
  );
}
