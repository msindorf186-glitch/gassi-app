export type RoutePoint = { lat: number; lng: number };

const EARTH_RADIUS_M = 6371000;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineMeters(a: RoutePoint, b: RoutePoint) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function totalDistanceMeters(points: RoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineMeters(points[i - 1], points[i]);
  }
  return total;
}

/** WKT LINESTRING für PostGIS — geography(linestring,4326) akzeptiert Text implizit. */
export function pointsToLineStringWkt(points: RoutePoint[]): string {
  const coords = points.map((p) => `${p.lng} ${p.lat}`).join(", ");
  return `LINESTRING(${coords})`;
}
