import { WalkForm } from "@/components/features/walk/WalkForm";

export default function NeuerSpaziergangPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <h1 className="mb-4 font-display text-xl font-bold text-ink">
        Spaziergang bestätigen
      </h1>
      <WalkForm />
    </main>
  );
}
