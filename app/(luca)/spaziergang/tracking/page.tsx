import { redirect } from "next/navigation";
import { LiveTracking } from "@/components/features/route/LiveTracking";

type Props = { searchParams: Promise<{ walkId?: string }> };

export default async function TrackingPage({ searchParams }: Props) {
  const { walkId } = await searchParams;
  if (!walkId) redirect("/");

  return <LiveTracking walkId={walkId} />;
}
