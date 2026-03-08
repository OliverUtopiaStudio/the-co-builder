import { redirect } from "next/navigation";
import { getCurrentFellowId } from "@/app/actions/fellows";
import MarketingContentPlan from "@/components/marketing/MarketingContentPlan";

export default async function MarketingPage() {
  const { isStudio } = await getCurrentFellowId();
  if (!isStudio) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-4xl">
      <MarketingContentPlan />
    </div>
  );
}
