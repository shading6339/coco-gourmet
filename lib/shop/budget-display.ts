export type BudgetRanges = {
  day: string | null;
  night: string | null;
};

const DAY_PATTERN = /ランチ|昼食|昼間|モーニング|ブランチ/;
const NIGHT_PATTERN = /通常|夜|ディナー|宴会|夕食|晩|ディナ|dinner/i;

const yenFormatter = new Intl.NumberFormat("ja-JP");

function parseYenAmounts(text: string): number[] {
  const amounts: number[] = [];
  const pattern = /(\d{1,3}(?:,\d{3})*|\d+)\s*円/g;
  for (const match of text.matchAll(pattern)) {
    const value = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) {
      amounts.push(value);
    }
  }
  return amounts;
}

/** 金額群を 500 円刻みの表示レンジに変換（例: 1,000~1,500円） */
export function amountsToRangeLabel(amounts: number[]): string | null {
  if (amounts.length === 0) return null;

  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const low = Math.floor(min / 500) * 500;
  const high = Math.max(low + 500, Math.ceil(max / 500) * 500);

  return `${yenFormatter.format(low)}~${yenFormatter.format(high)}円`;
}

function classifySegment(segment: string): "day" | "night" {
  if (DAY_PATTERN.test(segment)) return "day";
  if (NIGHT_PATTERN.test(segment)) return "night";
  return "night";
}

function parseNameCodeRange(name: string): BudgetRanges {
  const tilde = name.match(/(\d+)\s*[～~]\s*(\d+)\s*円/);
  if (tilde) {
    const min = Number(tilde[1]);
    const max = Number(tilde[2]);
    return { day: null, night: amountsToRangeLabel([min, max]) };
  }

  const upTo = name.match(/～\s*(\d+)\s*円/);
  if (upTo) {
    return { day: null, night: amountsToRangeLabel([Number(upTo[1])]) };
  }

  return { day: null, night: null };
}

/**
 * budget.average / budget.name から昼・夜の 500 円刻みレンジを生成
 */
export function parseBudgetRanges(
  average?: string,
  name?: string,
): BudgetRanges {
  const source = average?.trim() ?? "";
  if (!source) {
    return name ? parseNameCodeRange(name) : { day: null, night: null };
  }

  const dayAmounts: number[] = [];
  const nightAmounts: number[] = [];
  const segments = source.split(/、|,/);

  if (segments.length === 1) {
    const amounts = parseYenAmounts(source);
    const bucket = classifySegment(source);
    if (bucket === "day") dayAmounts.push(...amounts);
    else nightAmounts.push(...amounts);
  } else {
    for (const segment of segments) {
      const trimmed = segment.trim();
      if (!trimmed) continue;
      const amounts = parseYenAmounts(trimmed);
      if (classifySegment(trimmed) === "day") {
        dayAmounts.push(...amounts);
      } else {
        nightAmounts.push(...amounts);
      }
    }
  }

  const ranges: BudgetRanges = {
    day: amountsToRangeLabel(dayAmounts),
    night: amountsToRangeLabel(nightAmounts),
  };

  if (!ranges.day && !ranges.night && name) {
    return parseNameCodeRange(name);
  }

  return ranges;
}
