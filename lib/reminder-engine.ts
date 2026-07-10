/**
 * Erinnerungs-Zustandsmaschine (siehe Konzept Abschnitt 02).
 * Ein Zyklus beginnt beim letzten bestätigten Spaziergang — oder, falls heute
 * noch keiner stattfand, an der eingestellten Startzeit. Von dort aus:
 *   T+60min  → sanfte Erinnerung ("first")
 *   T+90min  → direkte Erinnerung ("second")
 *   T+105min → dringende Erinnerung ("urgent"), sofern noch unbestätigt
 * Reine Funktionen, ohne DB-Zugriff — nutzbar sowohl im Dashboard (Anzeige)
 * als auch im Cron-Job (Task 5, tatsächlicher Versand).
 */
import { berlinTimeToday } from "@/lib/date-berlin";

export type ReminderSettings = {
  startTime: string; // "HH:MM"
  intervalMin: number; // Standard 90
  escalationMin: number; // Standard 15 (zusätzliche Minuten bis "urgent")
  dayEndTime: string; // "HH:MM"
};

export type ReminderStage = "none" | "first" | "second" | "urgent";

const FIRST_STAGE_OFFSET_MIN = 60;
const atTimeToday = berlinTimeToday;

/** Startpunkt des aktuellen Zyklus: letzter Spaziergang, oder heutige Startzeit. */
export function getCycleStart(
  now: Date,
  lastWalkAt: Date | null,
  settings: ReminderSettings
): Date {
  if (lastWalkAt) return lastWalkAt;
  return atTimeToday(now, settings.startTime);
}

/** Zeitpunkt der zweiten (direkten) Erinnerung — das ist zugleich der
 * "nächster Spaziergang fällig um"-Zeitpunkt für die Countdown-Anzeige. */
export function getNextWalkDueAt(cycleStart: Date, settings: ReminderSettings): Date {
  return new Date(cycleStart.getTime() + settings.intervalMin * 60_000);
}

export function getStageAt(
  now: Date,
  cycleStart: Date,
  settings: ReminderSettings
): ReminderStage {
  const minutesSinceStart = (now.getTime() - cycleStart.getTime()) / 60_000;

  if (minutesSinceStart >= settings.intervalMin + settings.escalationMin) return "urgent";
  if (minutesSinceStart >= settings.intervalMin) return "second";
  if (minutesSinceStart >= FIRST_STAGE_OFFSET_MIN) return "first";
  return "none";
}

/** Ob Erinnerungen aktuell pausiert sind (außerhalb des Tagesfensters). */
export function isWithinReminderWindow(now: Date, settings: ReminderSettings): boolean {
  const start = atTimeToday(now, settings.startTime);
  const end = atTimeToday(now, settings.dayEndTime);
  return now >= start && now <= end;
}
