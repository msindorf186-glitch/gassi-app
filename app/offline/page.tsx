export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <span className="text-4xl">🐾</span>
      <h1 className="font-display text-xl font-bold text-ink">Keine Verbindung</h1>
      <p className="max-w-xs text-sm text-ink-soft">
        Die Gassi-App braucht kurz wieder Internet. Sobald du online bist, geht
        es hier automatisch weiter.
      </p>
    </main>
  );
}
