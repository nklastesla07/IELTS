import { Submission } from '@prisma/client';

export type Skill = 'LISTENING' | 'READING';
export type SubmissionMode = 'PART_OR_PASSAGE' | 'FULL_TEST';

export interface QuestionTypeStat {
  questionType: string;
  correct: number;
  total: number;
  accuracy: number; // percentage 0-100
}

export interface PartAccuracyStat {
  partNo: number; // 1-4 for Listening, 1-3 for Reading
  label: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface ErrorCategoryStat {
  groupName: string;
  count: number;
  percentage: number;
}

export interface ErrorTagRankStat {
  code: string;
  label: string;
  groupName: string;
  count: number;
}

export interface AnalyticsSummary {
  totalSubmissions: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;
  listeningAccuracy: number;
  readingAccuracy: number;
  accuracyOverTime: Array<{
    date: string;
    accuracy: number;
    listeningAccuracy: number | null;
    readingAccuracy: number | null;
  }>;
  partAccuracyListening: PartAccuracyStat[];
  partAccuracyReading: PartAccuracyStat[];
  questionTypeStats: QuestionTypeStat[];
  errorCategoryStats: ErrorCategoryStat[];
  topErrorTags: ErrorTagRankStat[];
}

export function parseJsonSafely<T>(jsonStr: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return defaultValue;
  }
}

export function calculateAnalytics(
  submissions: Submission[],
  errorTagMap: Map<string, { label: string; groupName: string; skill: string }>
): AnalyticsSummary {
  if (!submissions || submissions.length === 0) {
    return {
      totalSubmissions: 0,
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      listeningAccuracy: 0,
      readingAccuracy: 0,
      accuracyOverTime: [],
      partAccuracyListening: [1, 2, 3, 4].map((p) => ({
        partNo: p,
        label: `Part ${p}`,
        correct: 0,
        total: 0,
        accuracy: 0,
      })),
      partAccuracyReading: [1, 2, 3].map((p) => ({
        partNo: p,
        label: `Passage ${p}`,
        correct: 0,
        total: 0,
        accuracy: 0,
      })),
      questionTypeStats: [],
      errorCategoryStats: [],
      topErrorTags: [],
    };
  }

  let totalQuestionsAttempted = 0;
  let totalCorrect = 0;

  let listeningCorrect = 0;
  let listeningTotal = 0;

  let readingCorrect = 0;
  let readingTotal = 0;

  // Part / Passage aggregations
  const lisParts = { 1: { c: 0, t: 0 }, 2: { c: 0, t: 0 }, 3: { c: 0, t: 0 }, 4: { c: 0, t: 0 } };
  const readParts = { 1: { c: 0, t: 0 }, 2: { c: 0, t: 0 }, 3: { c: 0, t: 0 } };

  // Question Types aggregation { "Gap Filling": { correct, total } }
  const qTypeMap: Record<string, { correct: number; total: number }> = {};

  // Error tag code frequency map { "LIS_PRON_LINKING": 4 }
  const tagCountMap: Record<string, number> = {};

  // Accuracy over time (sorted chronologically)
  const timeMap: Record<string, { lisC: number; lisT: number; readC: number; readT: number }> = {};

  submissions.forEach((sub) => {
    totalQuestionsAttempted += sub.totalCount;
    totalCorrect += sub.correctCount;

    if (sub.skill === 'LISTENING') {
      listeningCorrect += sub.correctCount;
      listeningTotal += sub.totalCount;

      if (sub.partOrPassageNo && sub.partOrPassageNo >= 1 && sub.partOrPassageNo <= 4) {
        const p = sub.partOrPassageNo as 1 | 2 | 3 | 4;
        lisParts[p].c += sub.correctCount;
        lisParts[p].t += sub.totalCount;
      }
    } else if (sub.skill === 'READING') {
      readingCorrect += sub.correctCount;
      readingTotal += sub.totalCount;

      if (sub.partOrPassageNo && sub.partOrPassageNo >= 1 && sub.partOrPassageNo <= 3) {
        const p = sub.partOrPassageNo as 1 | 2 | 3;
        readParts[p].c += sub.correctCount;
        readParts[p].t += sub.totalCount;
      }
    }

    // Time series grouping by date (YYYY-MM-DD)
    const dateKey = new Date(sub.submittedAt).toISOString().split('T')[0];
    if (!timeMap[dateKey]) {
      timeMap[dateKey] = { lisC: 0, lisT: 0, readC: 0, readT: 0 };
    }
    if (sub.skill === 'LISTENING') {
      timeMap[dateKey].lisC += sub.correctCount;
      timeMap[dateKey].lisT += sub.totalCount;
    } else {
      timeMap[dateKey].readC += sub.correctCount;
      timeMap[dateKey].readT += sub.totalCount;
    }

    // Parse Question Type Breakdown
    const qBreakdown = parseJsonSafely<Record<string, { correct: number; total: number }>>(
      sub.questionTypeBreakdown,
      {}
    );
    Object.entries(qBreakdown).forEach(([qType, stat]) => {
      if (!qTypeMap[qType]) qTypeMap[qType] = { correct: 0, total: 0 };
      qTypeMap[qType].correct += stat.correct || 0;
      qTypeMap[qType].total += stat.total || 0;
    });

    // Parse Error Tags
    const codes = parseJsonSafely<string[]>(sub.errorTagCodes, []);
    codes.forEach((code) => {
      tagCountMap[code] = (tagCountMap[code] || 0) + 1;
    });
  });

  const overallAccuracy =
    totalQuestionsAttempted > 0 ? Math.round((totalCorrect / totalQuestionsAttempted) * 1000) / 10 : 0;

  const listeningAccuracy =
    listeningTotal > 0 ? Math.round((listeningCorrect / listeningTotal) * 1000) / 10 : 0;

  const readingAccuracy =
    readingTotal > 0 ? Math.round((readingCorrect / readingTotal) * 1000) / 10 : 0;

  // Time series array
  const accuracyOverTime = Object.keys(timeMap)
    .sort()
    .map((date) => {
      const entry = timeMap[date];
      const dayTot = entry.lisT + entry.readT;
      const dayCor = entry.lisC + entry.readC;
      return {
        date,
        accuracy: dayTot > 0 ? Math.round((dayCor / dayTot) * 1000) / 10 : 0,
        listeningAccuracy: entry.lisT > 0 ? Math.round((entry.lisC / entry.lisT) * 1000) / 10 : null,
        readingAccuracy: entry.readT > 0 ? Math.round((entry.readC / entry.readT) * 1000) / 10 : null,
      };
    });

  // Part stats
  const partAccuracyListening: PartAccuracyStat[] = ([1, 2, 3, 4] as const).map((p) => ({
    partNo: p,
    label: `Part ${p}`,
    correct: lisParts[p].c,
    total: lisParts[p].t,
    accuracy: lisParts[p].t > 0 ? Math.round((lisParts[p].c / lisParts[p].t) * 1000) / 10 : 0,
  }));

  const partAccuracyReading: PartAccuracyStat[] = ([1, 2, 3] as const).map((p) => ({
    partNo: p,
    label: `Passage ${p}`,
    correct: readParts[p].c,
    total: readParts[p].t,
    accuracy: readParts[p].t > 0 ? Math.round((readParts[p].c / readParts[p].t) * 1000) / 10 : 0,
  }));

  // Question Type stats
  const questionTypeStats: QuestionTypeStat[] = Object.entries(qTypeMap).map(([questionType, stat]) => ({
    questionType,
    correct: stat.correct,
    total: stat.total,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 1000) / 10 : 0,
  }));

  // Error Category Group stats
  const categoryCountMap: Record<string, number> = {};
  let totalErrorTicks = 0;

  Object.entries(tagCountMap).forEach(([code, count]) => {
    totalErrorTicks += count;
    const tagInfo = errorTagMap.get(code);
    const groupName = tagInfo ? tagInfo.groupName : 'Khác';
    categoryCountMap[groupName] = (categoryCountMap[groupName] || 0) + count;
  });

  const errorCategoryStats: ErrorCategoryStat[] = Object.entries(categoryCountMap).map(
    ([groupName, count]) => ({
      groupName,
      count,
      percentage: totalErrorTicks > 0 ? Math.round((count / totalErrorTicks) * 1000) / 10 : 0,
    })
  );

  // Top Error Tags ranking
  const topErrorTags: ErrorTagRankStat[] = Object.entries(tagCountMap)
    .map(([code, count]) => {
      const tagInfo = errorTagMap.get(code);
      return {
        code,
        label: tagInfo ? tagInfo.label : code,
        groupName: tagInfo ? tagInfo.groupName : 'Lỗi hệ thống',
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalSubmissions: submissions.length,
    totalQuestionsAttempted,
    totalCorrect,
    overallAccuracy,
    listeningAccuracy,
    readingAccuracy,
    accuracyOverTime,
    partAccuracyListening,
    partAccuracyReading,
    questionTypeStats,
    errorCategoryStats,
    topErrorTags,
  };
}
