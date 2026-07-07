export type DayRating = "green" | "yellow" | "red";

/** Ampel-Bewertung eines Tages: grün = Ziel erreicht, gelb = teilweise,
 * rot = weniger als die Hälfte des Ziels. */
export function rateDay(count: number, target: number): DayRating {
  if (count >= target) return "green";
  if (count >= target / 2) return "yellow";
  return "red";
}
