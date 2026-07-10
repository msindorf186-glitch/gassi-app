/**
 * Die Familie lebt in Deutschland — "heute", "05:45" usw. sind immer als
 * deutsche Ortszeit gemeint. Server (z. B. Vercel) laufen aber meist in UTC,
 * daher hier explizit über Europe/Berlin rechnen (inkl. Sommer-/Winterzeit),
 * statt uns auf die Server-Zeitzone zu verlassen.
 */
const TIME_ZONE = "Europe/Berlin";

/** UTC-Offset (z. B. "+02:00") von Europe/Berlin an einem gegebenen Zeitpunkt. */
function berlinUtcOffset(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const match = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return "+01:00";
  const [, sign, hh, mm = "00"] = match;
  return `${sign}${hh.padStart(2, "0")}:${mm}`;
}

/** YYYY-MM-DD des übergebenen Zeitpunkts in Berliner Ortszeit. */
export function berlinDateKey(reference: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);
}

/** Baut einen exakten Zeitpunkt aus einem Kalendertag ("YYYY-MM-DD") + Uhrzeit
 * ("HH:MM"), beides als Berliner Ortszeit interpretiert — DST-sicher, da der
 * Offset anhand des Mittags (UTC) dieses Kalendertags bestimmt wird. */
export function berlinDateTime(dateStr: string, hhmm: string = "00:00"): Date {
  const [h, m] = hhmm.split(":");
  const noonUtcSameDay = new Date(`${dateStr}T12:00:00Z`);
  const offset = berlinUtcOffset(noonUtcSameDay);
  return new Date(`${dateStr}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00${offset}`);
}

/** Der Zeitpunkt "hh:mm Uhr" am Berliner Kalendertag von `reference`. */
export function berlinTimeToday(reference: Date, hhmm: string): Date {
  return berlinDateTime(berlinDateKey(reference), hhmm);
}

/** Mitternacht (00:00) des Berliner Kalendertags von `reference`. */
export function startOfBerlinDay(reference: Date): Date {
  return berlinTimeToday(reference, "00:00");
}
