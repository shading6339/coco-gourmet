/** API 原文の詰まり（）17:00 など）を読みやすくする */
export function normalizeOpenHours(raw: string): string {
  return raw
    .replace(/）(\d)/g, "）\n$1")
    .replace(/】(\d)/g, "】\n$1")
    .replace(/】、/g, "】\n")
    .replace(/(\d{2}:\d{2})(\d{2}:\d{2})/g, "$1 $2")
    .trim();
}

/** 詳細: 営業時間を行ごとに分割（公式表示に近い粒度） */
export function splitOpenHoursLines(raw: string): string[] {
  const normalized = normalizeOpenHours(raw)
    .replace(/）\s*(?=[月火水木金土日※])/g, "）\n")
    .replace(/[：:]/g, ": ");

  const lines: string[] = [];

  for (const chunk of normalized.split(/\n+/)) {
    const trimmed = chunk.trim();
    if (!trimmed || /^定休日[:：]/.test(trimmed)) continue;

    if (trimmed.length > 72) {
      trimmed.split(/(?<=）)/).forEach((part) => {
        const p = part.trim();
        if (p && !/^定休日[:：]/.test(p)) lines.push(p);
      });
      continue;
    }

    lines.push(trimmed);
  }

  return lines.length > 0 ? lines : [raw.trim()].filter(Boolean);
}

export type OpenHoursDisplayLine = {
  kind: "schedule" | "footnote";
  text: string;
};

/** 営業時間本文を表示用の行に分ける（L.O. や ※ 注記はそのまま残す） */
export function splitOpenHoursDisplayLines(raw: string): OpenHoursDisplayLine[] {
  return splitOpenHoursLines(raw).map((text) => ({
    kind: text.startsWith("※") ? "footnote" : "schedule",
    text,
  }));
}
