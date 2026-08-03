import { toZonedTime, format } from 'date-fns-tz';

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Returns YYYY-MM-DD string for a given date in Vietnam Timezone.
 */
export function getVnDateString(date: Date = new Date()): string {
  const zonedDate = toZonedTime(date, VN_TIMEZONE);
  return format(zonedDate, 'yyyy-MM-dd', { timeZone: VN_TIMEZONE });
}

/**
 * Calculates updated streak information based on the student's previous streak and activity date.
 */
export function calculateNewStreak(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: Date | null,
  submissionDate: Date = new Date()
): { newCurrentStreak: number; newLongestStreak: number; newLastActiveDate: Date } {
  const subDateStr = getVnDateString(submissionDate);

  if (!lastActiveDate) {
    // First time submitting
    return {
      newCurrentStreak: 1,
      newLongestStreak: Math.max(longestStreak, 1),
      newLastActiveDate: submissionDate,
    };
  }

  const lastDateStr = getVnDateString(lastActiveDate);

  if (subDateStr === lastDateStr) {
    // Already submitted today, maintain current streak
    return {
      newCurrentStreak: Math.max(currentStreak, 1),
      newLongestStreak: Math.max(longestStreak, currentStreak, 1),
      newLastActiveDate: submissionDate,
    };
  }

  // Check if last active was yesterday
  const subDateTime = new Date(subDateStr).getTime();
  const lastDateTime = new Date(lastDateStr).getTime();
  const diffDays = Math.round((subDateTime - lastDateTime) / (1000 * 60 * 60 * 24));

  let updatedCurrentStreak: number;

  if (diffDays === 1) {
    // Consecutive day
    updatedCurrentStreak = currentStreak + 1;
  } else if (diffDays > 1) {
    // Missed one or more days -> reset to 1
    updatedCurrentStreak = 1;
  } else {
    // Submission is somehow in the past relative to lastActiveDate -> maintain
    updatedCurrentStreak = currentStreak;
  }

  const updatedLongestStreak = Math.max(longestStreak, updatedCurrentStreak);

  return {
    newCurrentStreak: updatedCurrentStreak,
    newLongestStreak: updatedLongestStreak,
    newLastActiveDate: submissionDate,
  };
}
