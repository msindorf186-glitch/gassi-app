import { getReminderSettings } from "@/lib/data/settings";
import { getPushTexts } from "@/lib/data/push-texts";
import { ReminderSettingsForm } from "@/components/features/settings/ReminderSettingsForm";
import { PushTextEditor } from "@/components/features/settings/PushTextEditor";

export default async function EinstellungenPage() {
  const [settings, texts] = await Promise.all([getReminderSettings(), getPushTexts()]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">Einstellungen</h1>
      <ReminderSettingsForm settings={settings} />
      <PushTextEditor texts={texts} />
    </div>
  );
}
