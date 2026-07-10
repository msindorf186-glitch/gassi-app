import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rateDay, type DayRating } from "@/lib/stats";
import { berlinDateKey, berlinDateTime } from "@/lib/date-berlin";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function getMonthWalks(year: number, month: number) {
  const supabase = await createClient();
  const start = berlinDateTime(`${year}-${pad(month)}-01`);
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const end = berlinDateTime(`${nextMonth.year}-${pad(nextMonth.month)}-01`);

  const { data, error } = await supabase
    .from("walks")
    .select("id, walked_at")
    .gte("walked_at", start.toISOString())
    .lt("walked_at", end.toISOString());

  if (error) throw error;
  return data;
}

export async function getDayRatings(
  year: number,
  month: number,
  target: number
): Promise<Record<string, { count: number; rating: DayRating }>> {
  const walks = await getMonthWalks(year, month);
  const counts: Record<string, number> = {};

  for (const walk of walks) {
    const key = berlinDateKey(new Date(walk.walked_at));
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const result: Record<string, { count: number; rating: DayRating }> = {};
  for (const [key, count] of Object.entries(counts)) {
    result[key] = { count, rating: rateDay(count, target) };
  }
  return result;
}

export async function getDayDetail(dateStr: string) {
  const supabase = await createClient();
  const start = berlinDateTime(dateStr);
  const [y, m, d] = dateStr.split("-").map(Number);
  const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
  const end = berlinDateTime(
    `${nextDay.getUTCFullYear()}-${pad(nextDay.getUTCMonth() + 1)}-${pad(nextDay.getUTCDate())}`
  );

  const { data: walks, error } = await supabase
    .from("walks")
    .select("id, walked_at, duration_min, notes, peed, pooped, drank, has_route")
    .gte("walked_at", start.toISOString())
    .lt("walked_at", end.toISOString())
    .order("walked_at", { ascending: true });

  if (error) throw error;
  if (!walks || walks.length === 0) return [];

  const walkIds = walks.map((w) => w.id);

  const [{ data: photos }, { data: routes }] = await Promise.all([
    supabase
      .from("walk_photos")
      .select("walk_id, storage_path, sort_order")
      .in("walk_id", walkIds)
      .order("sort_order", { ascending: true }),
    supabase.from("walk_routes").select("walk_id, distance_m").in("walk_id", walkIds),
  ]);

  const photosByWalk = new Map<string, { url: string | null; sortOrder: number }[]>();
  for (const photo of photos ?? []) {
    const { data: signed } = await supabase.storage
      .from("walk-photos")
      .createSignedUrl(photo.storage_path, 60 * 30);
    const list = photosByWalk.get(photo.walk_id) ?? [];
    list.push({ url: signed?.signedUrl ?? null, sortOrder: photo.sort_order });
    photosByWalk.set(photo.walk_id, list);
  }

  const distanceByWalk = new Map<string, number | null>();
  for (const route of routes ?? []) {
    distanceByWalk.set(route.walk_id, route.distance_m);
  }

  return walks.map((walk) => ({
    ...walk,
    photos: photosByWalk.get(walk.id) ?? [],
    distanceM: distanceByWalk.get(walk.id) ?? null,
  }));
}

export async function getStats(days: number) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("walks")
    .select("walked_at")
    .gte("walked_at", since.toISOString())
    .order("walked_at", { ascending: true });

  if (error) throw error;

  const perDay: Record<string, number> = {};
  for (const w of data ?? []) {
    const key = berlinDateKey(new Date(w.walked_at));
    perDay[key] = (perDay[key] ?? 0) + 1;
  }

  return {
    totalWalks: data?.length ?? 0,
    perDay,
  };
}
