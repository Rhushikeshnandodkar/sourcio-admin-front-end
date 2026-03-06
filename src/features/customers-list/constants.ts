/**
 * Constants for customers list feature
 */

export const DEFAULT_SIZE = 50;

export const STATS_CARD_CONFIGS = [
  {
    bg: "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
    cornerBg: "from-slate-200/50 to-transparent dark:from-slate-700/30",
  },
  {
    bg: "from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20",
    cornerBg: "from-emerald-200/40 to-transparent dark:from-emerald-800/20",
  },
  {
    bg: "from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20",
    cornerBg: "from-rose-200/40 to-transparent dark:from-rose-800/20",
  },
  {
    bg: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20",
    cornerBg: "from-blue-200/40 to-transparent dark:from-blue-800/20",
  },
] as const;
