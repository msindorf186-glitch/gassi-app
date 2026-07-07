"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { pointsToLineStringWkt, totalDistanceMeters, type RoutePoint } from "@/lib/geo/distance";

export type WalkFormState = { error?: string } | undefined;

const MAX_PHOTOS = 2;

export async function createWalk(
  _prevState: WalkFormState,
  formData: FormData
): Promise<WalkFormState> {
  const session = await requireSession();
  const supabase = await createClient();

  const durationRaw = formData.get("duration_min");
  const duration_min = durationRaw ? Number(durationRaw) : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const peed = formData.get("peed") === "on";
  const pooped = formData.get("pooped") === "on";
  const drank = formData.get("drank") === "on";
  const recordRoute = formData.get("record_route") === "on";

  const photos = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_PHOTOS);

  const { data: walk, error } = await supabase
    .from("walks")
    .insert({
      user_id: session.userId,
      duration_min,
      notes,
      peed,
      pooped,
      drank,
      has_route: false,
    })
    .select("id")
    .single();

  if (error || !walk) {
    return { error: "Spaziergang konnte nicht gespeichert werden. Nochmal versuchen." };
  }

  for (const [index, photo] of photos.entries()) {
    const path = `${session.userId}/${walk.id}/${index}-${photo.name}`;
    const { error: uploadError } = await supabase.storage
      .from("walk-photos")
      .upload(path, photo, { contentType: photo.type });

    if (!uploadError) {
      await supabase.from("walk_photos").insert({
        walk_id: walk.id,
        storage_path: path,
        sort_order: index,
      });
    }
  }

  if (recordRoute) {
    redirect(`/spaziergang/tracking?walkId=${walk.id}`);
  }

  redirect("/");
}

export async function saveWalkRoute(
  walkId: string,
  points: RoutePoint[],
  recordedFrom: string,
  recordedTo: string
) {
  await requireSession();

  if (points.length < 2) {
    redirect("/");
  }

  const supabase = await createClient();
  const distanceM = totalDistanceMeters(points);
  const path = pointsToLineStringWkt(points);

  await supabase.from("walk_routes").insert({
    walk_id: walkId,
    path,
    distance_m: distanceM,
    recorded_from: recordedFrom,
    recorded_to: recordedTo,
  });

  await supabase.from("walks").update({ has_route: true }).eq("id", walkId);

  redirect("/");
}
