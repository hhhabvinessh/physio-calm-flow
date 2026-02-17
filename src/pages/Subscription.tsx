import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import PrimaryButton from "@/components/PrimaryButton";
import { Check, Star } from "lucide-react";

const Subscription = () => {
  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container flex min-h-screen flex-col justify-center pb-8">
        <PageHeader title="Upgrade Plan" showBack />

        <SectionCard className="text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Star size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="mb-1">PhysioCare Pro</h2>
              <p className="text-muted-foreground">Unlock all features</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <div className="w-full space-y-3 py-2 text-left">
              {[
                "Unlimited patient slots",
                "Advanced progress analytics",
                "Custom exercise library",
                "Priority support",
                "Multi-clinic management",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check size={14} className="text-primary" />
                  </div>
                  <p className="text-[14px]">{feature}</p>
                </div>
              ))}
            </div>

            <PrimaryButton className="mt-2">Subscribe Now</PrimaryButton>
            <button className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Maybe later
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Subscription;
