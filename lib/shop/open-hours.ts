import {
  splitOpenHoursDisplayLines,
  type OpenHoursDisplayLine,
} from "@/lib/shop/format-shop-display";

export type OpenHoursStatus = "open" | "closed" | "unknown";

export type OpenHoursSummary = {
  lines: OpenHoursDisplayLine[];
  closedDay: string | null;
  status: OpenHoursStatus;
  todayHours: string | null;
};

const DAY_CHARS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** 表示用に時刻のチルダを統一（原文の L.O. 等は保持） */
export function formatHoursDisplay(hours: string): string {
  return hours.replace(/[〜～]/g, " - ").replace(/\s+/g, " ").trim();
}

/** 括弧内の補足（L.O. 等）は時刻判定用から除去 */
function stripNotesForParsing(hours: string): string {
  return hours.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();
}

function parseTimeToMinutes(token: string): number | null {
  const normalized = token.replace(/^翌/, "").trim();
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 29 || minutes < 0 || minutes > 59) return null;
  const base = hours * 60 + minutes;
  return token.startsWith("翌") ? base + 24 * 60 : base;
}

function parseTimeRanges(hours: string): Array<{ start: number; end: number }> {
  const cleaned = stripNotesForParsing(hours);
  const segments = cleaned.split(/[、,]/).map((part) => part.trim()).filter(Boolean);
  const targets = segments.length > 0 ? segments : [cleaned];
  const ranges: Array<{ start: number; end: number }> = [];

  for (const segment of targets) {
    const match = segment.match(/(翌?\d{1,2}:\d{2})\s*[-－—〜～]\s*(翌?\d{1,2}:\d{2})/);
    if (!match) continue;
    const start = parseTimeToMinutes(match[1]);
    const end = parseTimeToMinutes(match[2]);
    if (start !== null && end !== null) ranges.push({ start, end });
  }

  return ranges;
}

function isWithinRange(nowMinutes: number, start: number, end: number): boolean {
  const dayMinutes = 24 * 60;
  if (end > dayMinutes) {
    return nowMinutes >= start || nowMinutes < end % dayMinutes;
  }
  if (end > start) return nowMinutes >= start && nowMinutes < end;
  return nowMinutes >= start || nowMinutes < end;
}

type ParsedSchedule = {
  label: string;
  hours: string;
};

function parseScheduleLine(text: string): ParsedSchedule {
  const colonMatch = text.match(/^(.+?)[:：]\s*(.+)$/);
  if (colonMatch && /\d{1,2}:\d{2}/.test(colonMatch[2])) {
    return { label: colonMatch[1].trim(), hours: colonMatch[2].trim() };
  }

  const spacedMatch = text.match(/^(.+?)[\s　]+((?:翌)?\d{1,2}:\d{2}.+)$/);
  if (spacedMatch) {
    return { label: spacedMatch[1].trim(), hours: spacedMatch[2].trim() };
  }

  if (/\d{1,2}:\d{2}/.test(text)) {
    return { label: "", hours: text.trim() };
  }

  return { label: text.trim(), hours: "" };
}

function segmentMatchesDay(segment: string, day: number): boolean {
  if (!segment || /祝/.test(segment)) return false;

  const dayChar = DAY_CHARS[day];

  if (/毎日|全日|年中無休/.test(segment)) return true;
  if (/平日/.test(segment) && day >= 1 && day <= 5) return true;
  if (/週末|土日/.test(segment) && (day === 0 || day === 6)) return true;

  const rangeMatch = segment.match(/([月火水木金土日])[~〜～－-]([月火水木金土日])/);
  if (rangeMatch) {
    const startIdx = DAY_CHARS.indexOf(rangeMatch[1] as (typeof DAY_CHARS)[number]);
    const endIdx = DAY_CHARS.indexOf(rangeMatch[2] as (typeof DAY_CHARS)[number]);
    if (startIdx >= 0 && endIdx >= 0) {
      if (startIdx <= endIdx) return day >= startIdx && day <= endIdx;
      return day >= startIdx || day <= endIdx;
    }
  }

  if (segment === dayChar || segment === `${dayChar}曜` || segment.endsWith(dayChar)) {
    return true;
  }

  return false;
}

function labelMatchesDay(label: string, day: number): boolean {
  if (!label.trim()) return true;
  if (/定休/.test(label)) return false;

  const segments = label.split(/[、,]/).map((part) => part.trim()).filter(Boolean);
  if (segments.length === 0) return false;
  return segments.some((segment) => segmentMatchesDay(segment, day));
}

function findTodaySchedule(lines: OpenHoursDisplayLine[], day: number): ParsedSchedule | null {
  const schedules = lines
    .filter((line) => line.kind === "schedule")
    .map((line) => parseScheduleLine(line.text));

  const matched = schedules.filter((entry) => entry.hours && labelMatchesDay(entry.label, day));
  if (matched.length > 0) return matched[0];

  const generic = schedules.find((entry) => !entry.label && entry.hours);
  if (generic) return generic;

  return schedules.find((entry) => entry.hours) ?? null;
}

function resolveStatus(
  lines: OpenHoursDisplayLine[],
  closedDay: string | null,
  now: Date,
): OpenHoursStatus {
  if (closedDay && /なし|無し/.test(closedDay)) {
    // 定休日なし — 時刻で判定を続行
  } else if (closedDay) {
    const day = now.getDay();
    const dayChar = DAY_CHARS[day];
    if (closedDay.includes(dayChar) || closedDay.includes(`${dayChar}曜`)) {
      return "closed";
    }
  }

  const day = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const today = findTodaySchedule(lines, day);

  if (!today?.hours) return "unknown";

  const ranges = parseTimeRanges(today.hours);
  if (ranges.length === 0) return "unknown";

  const isOpen = ranges.some((range) => isWithinRange(nowMinutes, range.start, range.end));
  return isOpen ? "open" : "closed";
}

function normalizeClosedDay(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}

export function summarizeOpenHours(
  openRaw: string,
  closeRaw = "",
  now: Date = new Date(),
): OpenHoursSummary | null {
  const open = openRaw.trim();
  if (!open) return null;

  const lines = splitOpenHoursDisplayLines(open);
  const closedDay = normalizeClosedDay(closeRaw);
  const today = findTodaySchedule(lines, now.getDay());
  const todayHours = today?.hours ? formatHoursDisplay(today.hours) : null;

  return {
    lines,
    closedDay,
    status: resolveStatus(lines, closedDay, now),
    todayHours,
  };
}
