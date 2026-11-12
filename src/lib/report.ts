/** 报告 data JSON 的结构与默认值 */

export const RADAR_DIMS = [
  "动手搭建",
  "逻辑思维",
  "创意探究",
  "表达分享",
  "专注习惯",
  "协作能力",
] as const;

export const HABIT_LEVELS = ["领先", "良好", "待提升"] as const;

export type TimelineStage = { stage: string; period: string; note: string };
export type Achievement = { name: string; type: string };
export type ContestPlan = { name: string; date: string; status: string; note: string };

export type ReportData = {
  performance: string[]; // 表现关键词 id
  growthMoment: string; // 成长瞬间
  courses: string[]; // 入学课程 id
  nextStageText: string; // 下一阶段安排说明
  nextStageCourses: string[]; // 下一阶段推荐课程 id
  contests: string[]; // 赛事考级 id
  comment: string; // 教师寄语
  radar: number[]; // 6 维评分 1-5
  habit: string; // 学习习惯档位
  timeline: TimelineStage[]; // 过往学习状态（手动标注阶段）
  achievements: Achievement[]; // 学习成果
  plans: ContestPlan[]; // 比赛规划
};

export const DEFAULT_REPORT_DATA: ReportData = {
  performance: [],
  growthMoment: "",
  courses: [],
  nextStageText: "",
  nextStageCourses: [],
  contests: [],
  comment: "",
  radar: [3, 3, 3, 3, 3, 3],
  habit: "良好",
  timeline: [],
  achievements: [],
  plans: [],
};

export function parseReportData(raw: string | null | undefined): ReportData {
  if (!raw) return { ...DEFAULT_REPORT_DATA };
  try {
    return { ...DEFAULT_REPORT_DATA, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_REPORT_DATA };
  }
}
