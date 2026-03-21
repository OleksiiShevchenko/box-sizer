import { getSubscriptionInfo } from "@/actions/subscription-actions";
import { BillingClient } from "@/components/billing/billing-client";

interface BillingPageProps {
  searchParams?:
    | Promise<{ checkout?: string; portal?: string }>
    | { checkout?: string; portal?: string };
}

function getBannerMessage(checkout?: string, portal?: string): string | null {
  if (checkout === "success") {
    return "Checkout completed. Billing details will refresh automatically from Stripe.";
  }

  if (checkout === "cancel") {
    return "Checkout was canceled before payment was completed.";
  }

  if (portal === "return") {
    return "Returned from the Stripe billing portal.";
  }

  return null;
}

export default async function BillingSettingsPage({ searchParams }: BillingPageProps) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const subscriptionInfo = await getSubscriptionInfo();

  return (
    <BillingClient
      initialSubscription={subscriptionInfo}
      banner={getBannerMessage(params?.checkout, params?.portal)}
    />
  );
}
