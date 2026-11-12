import { requireOrg } from "@/lib/auth";
import { loadEditorRefs, loadReport, loadStudent } from "@/lib/editor-data";
import Editor from "@/components/report/Editor";

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireOrg();
  if (!ctx) return null;
  const { id } = await params;
  const loaded = await loadReport(ctx.orgId, id);
  if (!loaded) {
    return <p className="text-sm text-red-500">报告不存在或无权访问</p>;
  }
  const [refs, student] = await Promise.all([
    loadEditorRefs(ctx.orgId),
    loadStudent(ctx.orgId, loaded.report.studentId),
  ]);
  if (!student) {
    return <p className="text-sm text-red-500">学员不存在</p>;
  }
  return (
    <Editor
      reportId={loaded.report.id}
      student={student}
      data={loaded.data}
      refs={{ ...refs, reportNo: loaded.report.no }}
    />
  );
}
