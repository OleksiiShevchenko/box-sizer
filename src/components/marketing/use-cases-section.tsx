import { UseCaseSelector, type MarketingUseCase } from "@/components/marketing/use-case-selector";

const useCases: MarketingUseCase[] = [
  {
    icon: "shopping_cart",
    title: "Ecommerce brands with owned inventory",
    helper: "Mixed carts · bulky products · checkout quotes",
    desc: "For stores that ship mixed-product orders from their own warehouse or 3PL. Calculate the package size before checkout so bulky or multi-item orders do not destroy shipping margin.",
    image: {
      src: "/marketing/use-cases/ecommerce.png",
      alt: "Ecommerce use case packaging workflow",
      width: 1376,
      height: 768,
    },
  },
  {
    icon: "package_2",
    title: "Promo warehouse programs",
    helper: "Stored merch · company stores · event shipments",
    desc: "For distributors storing customer merchandise and shipping different combinations to employees, events, offices, or customers. Select the right box and quote shipping before the warehouse packs the order.",
    image: {
      src: "/marketing/use-cases/promo.png",
      alt: "Promo warehouse programs use case",
      width: 1024,
      height: 1024,
    },
  },
  {
    icon: "card_giftcard",
    title: "Corporate gifting platforms",
    helper: "Giveaways · direct mail · recipient shipments",
    desc: "For gifting workflows where stored products are sent to many recipients in different combinations. Estimate package dimensions, charge shipping accurately, and give fulfillment teams packing instructions.",
    image: {
      src: "/marketing/use-cases/gifting.png",
      alt: "Corporate gifting platforms use case",
      width: 1024,
      height: 1024,
    },
  },
  {
    icon: "redeem",
    title: "Custom kit planning",
    helper: "Welcome kits · custom boxes · presentation layout",
    desc: "For teams building gift boxes, welcome kits, or event kits with customer-defined contents. Calculate the box size before ordering custom packaging and generate a packing layout that matches the desired presentation.",
    image: {
      src: "/marketing/use-cases/kitting-v1.png",
      alt: "Custom kit planning use case",
      width: 1024,
      height: 1024,
    },
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-24 md:py-32 bg-surface-container-low px-6">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-6"
          data-reveal="up"
        >
          Where smarter box selection matters
        </h2>
        <UseCaseSelector useCases={useCases} />
      </div>
    </section>
  );
}
