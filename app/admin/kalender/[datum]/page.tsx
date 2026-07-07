import { getDayDetail } from "@/lib/data/admin";
import { Card } from "@/components/ui/Card";

type Props = { params: Promise<{ datum: string }> };

export default async function TagesdetailPage({ params }: Props) {
  const { datum } = await params;
  const walks = await getDayDetail(datum);

  const date = new Date(`${datum}T00:00:00`);
  const dateLabel = date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold text-ink capitalize">{dateLabel}</h1>
        <p className="text-sm text-ink-soft">{walks.length} Spaziergänge</p>
      </div>

      {walks.length === 0 && (
        <Card className="text-center text-sm text-ink-soft">
          An diesem Tag wurde kein Spaziergang dokumentiert.
        </Card>
      )}

      {walks.map((walk) => {
        const time = new Date(walk.walked_at).toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const checks = [
          walk.peed && "Pipi",
          walk.pooped && "Kot",
          walk.drank && "Getrunken",
        ].filter(Boolean);

        return (
          <Card key={walk.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-semibold text-ink">
                {time}
                {walk.duration_min ? ` · ${walk.duration_min} Min` : ""}
              </span>
              {walk.distanceM != null && (
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong">
                  📍 {(walk.distanceM / 1000).toFixed(1)} km
                </span>
              )}
            </div>
            {checks.length > 0 && (
              <p className="text-sm text-ink-soft">{checks.join(" · ")}</p>
            )}
            {walk.notes && <p className="text-sm text-ink">„{walk.notes}“</p>}
            {walk.photos.length > 0 && (
              <div className="flex gap-2">
                {walk.photos.map((photo, i) =>
                  photo.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={photo.url}
                      alt="Foto vom Spaziergang"
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                  ) : null
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
