"use client";

import { useEffect, useRef, useState } from "react";
import { saveWalkRoute } from "@/lib/walks/actions";
import { totalDistanceMeters, type RoutePoint } from "@/lib/geo/distance";
import { Button } from "@/components/ui/Button";

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildSvgPath(points: RoutePoint[]) {
  if (points.length < 2) return "";
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat || 0.0001;
  const lngSpan = maxLng - minLng || 0.0001;

  return points
    .map((p, i) => {
      const x = ((p.lng - minLng) / lngSpan) * 90 + 5;
      const y = 95 - ((p.lat - minLat) / latSpan) * 90;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function LiveTracking({ walkId }: { walkId: string }) {
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [startedAt] = useState(() => new Date());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => setError("Dieses Gerät unterstützt keine Standortermittlung."));
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPoints((prev) => [
          ...prev,
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
        ]);
      },
      () => setError("Standort konnte nicht ermittelt werden. Bitte Zugriff erlauben."),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt.getTime()), 1000);

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(timer);
    };
  }, [startedAt]);

  const distanceKm = (totalDistanceMeters(points) / 1000).toFixed(1);

  async function handleStop() {
    setSaving(true);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    await saveWalkRoute(walkId, points, startedAt.toISOString(), new Date().toISOString());
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-5 py-8">
      <h1 className="font-display text-xl font-bold text-ink">
        Route wird aufgezeichnet
      </h1>
      <p className="text-sm text-ink-soft">läuft seit {formatElapsed(elapsedMs)}</p>

      {error ? (
        <p className="text-sm text-critical">{error}</p>
      ) : (
        <div className="h-40 rounded-2xl border border-border bg-gradient-to-br from-accent-soft to-sky-soft">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <path d={buildSvgPath(points)} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface-raised p-4 text-center">
          <p className="font-mono text-xl font-bold text-ink">{distanceKm} km</p>
          <p className="text-sm text-ink-soft">Distanz</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-raised p-4 text-center">
          <p className="font-mono text-xl font-bold text-ink">{formatElapsed(elapsedMs)}</p>
          <p className="text-sm text-ink-soft">Dauer</p>
        </div>
      </div>

      <Button
        variant="danger"
        size="lg"
        className="mt-auto w-full"
        onClick={handleStop}
        disabled={saving}
      >
        {saving ? "Speichere..." : "Stopp & speichern"}
      </Button>
    </main>
  );
}
