// Best-effort parser for the OSM `opening_hours` tag (https://wiki.openstreetmap.org/wiki/Key:opening_hours).
// It covers the common real-world patterns (day ranges + comma time ranges,
// 24/7, "off", overnight ranges) but not the full mini-language (holidays,
// week numbers, variable hours like "sunset"). When a string can't be
// parsed, callers get { known: false } and the UI must say "horario no
// disponible" rather than guessing — never invent a schedule.
const DAY_TOKENS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const DAY_INDEX = Object.fromEntries(DAY_TOKENS.map((d, i) => [d, i]));

function expandDayToken(token) {
  const parts = token.split(",");
  const days = [];
  for (const part of parts) {
    const rangeMatch = part.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)-(Mo|Tu|We|Th|Fr|Sa|Su)$/);
    if (rangeMatch) {
      const start = DAY_INDEX[rangeMatch[1]];
      const end = DAY_INDEX[rangeMatch[2]];
      let i = start;
      while (true) {
        days.push(i);
        if (i === end) break;
        i = (i + 1) % 7;
      }
    } else if (DAY_INDEX[part] !== undefined) {
      days.push(DAY_INDEX[part]);
    }
  }
  return days;
}

function parseTimeToMinutes(hh, mm) {
  return Number(hh) * 60 + Number(mm);
}

function parseRanges(timePart) {
  const ranges = [];
  const re = /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/g;
  let m;
  while ((m = re.exec(timePart))) {
    let start = parseTimeToMinutes(m[1], m[2]);
    let end = parseTimeToMinutes(m[3], m[4]);
    if (end === 0) end = 1440;
    ranges.push({ start, end });
  }
  return ranges;
}

export function parseOpeningHours(raw) {
  if (!raw || typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  const dayRanges = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  let touched = false;

  const rules = value.split(";").map((r) => r.trim()).filter(Boolean);
  for (const rule of rules) {
    const dayMatch = rule.match(
      /^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:,(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)\s*(.*)$/
    );

    let dayToken = null;
    let rest = rule;
    if (dayMatch) {
      dayToken = dayMatch[1];
      rest = dayMatch[2];
    }

    if (dayToken === "PH" || rest.trim().startsWith("PH")) continue; // holidays: not tracked, skip rather than guess

    const days = dayToken ? expandDayToken(dayToken) : [0, 1, 2, 3, 4, 5, 6];
    if (days.length === 0) continue;

    const restTrim = rest.trim();
    let ranges = [];
    let isClosed = false;

    if (/^24\/7$/i.test(restTrim) || restTrim === "") {
      ranges = restTrim === "" && !dayToken ? [] : [{ start: 0, end: 1440 }];
      if (restTrim === "" && !dayToken) continue; // nothing meaningful in this rule
    } else if (/^(off|closed)$/i.test(restTrim)) {
      isClosed = true;
    } else {
      ranges = parseRanges(restTrim);
      if (ranges.length === 0) continue; // unparsed rule (e.g. "sunset-sunrise") — skip, don't guess
    }

    for (const d of days) {
      dayRanges[d] = isClosed ? [] : ranges;
    }
    touched = true;
  }

  if (!touched) return null;
  return { dayRanges };
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

// Returns the place's live status relative to `date` (defaults to now):
//   { known: false }                                   — unparseable/missing hours
//   { known: true, isOpen: true,  closesAt: Date }      — open, with when it closes
//   { known: true, isOpen: false, opensAt: Date|null }  — closed, with next opening if findable
export function getOpeningStatus(rawOpeningHours, date = new Date()) {
  const parsed = parseOpeningHours(rawOpeningHours);
  if (!parsed) return { known: false };

  const todayIdx = mondayIndex(date);
  const minutes = date.getHours() * 60 + date.getMinutes();

  for (const r of parsed.dayRanges[todayIdx] || []) {
    if (r.end > r.start) {
      if (minutes >= r.start && minutes < r.end) {
        return { known: true, isOpen: true, closesAt: addMinutes(startOfDay(date), r.end) };
      }
    } else if (minutes >= r.start) {
      // overnight range starting today, spilling into tomorrow
      return { known: true, isOpen: true, closesAt: addMinutes(startOfDay(addDays(date, 1)), r.end) };
    }
  }

  const yesterdayIdx = (todayIdx + 6) % 7;
  for (const r of parsed.dayRanges[yesterdayIdx] || []) {
    if (r.end <= r.start && minutes < r.end) {
      return { known: true, isOpen: true, closesAt: addMinutes(startOfDay(date), r.end) };
    }
  }

  for (let add = 0; add <= 7; add++) {
    const idx = (todayIdx + add) % 7;
    const ranges = [...(parsed.dayRanges[idx] || [])].sort((a, b) => a.start - b.start);
    for (const r of ranges) {
      if (add === 0 && r.start <= minutes) continue;
      const base = add === 0 ? startOfDay(date) : startOfDay(addDays(date, add));
      return { known: true, isOpen: false, opensAt: addMinutes(base, r.start) };
    }
  }

  return { known: true, isOpen: false, opensAt: null };
}

export function formatClock(date) {
  return date.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
}
