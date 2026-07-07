export function BarChart({
  data,
  target,
}: {
  data: { label: string; value: number }[];
  target: number;
}) {
  const max = Math.max(target, ...data.map((d) => d.value), 1);

  return (
    <div className="flex h-32 items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={
              "w-full rounded-t-sm " + (d.value >= target ? "bg-accent" : "bg-amber")
            }
            style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            title={`${d.label}: ${d.value}`}
          />
        </div>
      ))}
    </div>
  );
}
