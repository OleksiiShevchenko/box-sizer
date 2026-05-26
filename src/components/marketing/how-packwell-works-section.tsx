import Image from "next/image";
import Link from "next/link";

const howPackwellSteps = [
  {
    step: "Step 1",
    title: "Define your packaging options",
    description:
      "Add the boxes you use for shipping, or let Packwell calculate the ideal box size automatically.",
    image: "/marketing/how-packwell/box-catalog.png",
    imageAlt: "Packwell box catalog UI showing available shipping boxes",
    imageWidth: 1396,
    imageHeight: 914,
    icon: "inventory_2",
  },
  {
    step: "Step 2",
    title: "Provide shipment details",
    description:
      "Send the items to be shipped, including dimensions, weight, and quantity. Optionally define packing rules like stacking or orientation.",
    image: "/marketing/how-packwell/shipment-details-products.png",
    imageAlt: "Packwell shipment details UI with item dimensions and weights",
    imageWidth: 965,
    imageHeight: 714,
    icon: "straighten",
  },
  {
    step: "Step 3",
    title: "Packwell calculates the best box",
    description:
      "Packwell uses a 3D Bin Packing Algorithm to select the best box for shipping the items and minimize dimensional weight and wasted space.",
    image: "/marketing/how-packwell/best-box-3d.png",
    imageAlt: "Packwell 3D packing visualization with the recommended box",
    imageWidth: 1386,
    imageHeight: 1420,
    icon: "view_in_ar",
  },
  {
    step: "Step 4",
    title: "Calculate real shipping cost",
    description:
      "Use actual weight and dimensional weight to get accurate shipping rates from your carrier. No more undercharging or surprise costs.",
    image: "/marketing/how-packwell/carrier-logos.png",
    imageAlt: "USPS, UPS, FedEx, and DHL carrier logos",
    imageWidth: 1152,
    imageHeight: 922,
    icon: "local_shipping",
  },
  {
    step: "Step 5",
    title: "Pack exactly as planned",
    description:
      "Follow the packing plan visualization to ensure orders are packed consistently and match what was quoted.",
    image: "/marketing/how-packwell/packing-instructions.png",
    imageAlt: "Packing instruction visualization with 3D, front, side, and top views",
    imageWidth: 1024,
    imageHeight: 1024,
    icon: "warehouse",
  },
];

export function HowPackwellWorksSection() {
  return (
    <section
      id="how-it-works"
      className="px-6 pt-24 pb-8 md:pt-32 md:pb-8 bg-surface-container-lowest"
      data-testid="how-packwell-section"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mx-auto max-w-3xl text-center" data-reveal="up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-on-background leading-tight">
            How Packwell works
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
            Use the Packwell UI or REST API to integrate precise box selection
            and packing instructions into your existing business process.
          </p>
        </div>

        <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-24">
          {howPackwellSteps.map((step, index) => {
            const imageFirst = index % 2 === 1;

            return (
              <div
                key={step.step}
                className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16"
                data-reveal="up"
              >
                <div className={imageFirst ? "lg:order-2" : undefined}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-primary shadow-[0_12px_24px_-18px_rgba(37,99,235,0.9)]">
                      <span
                        className="material-symbols-outlined text-[22px]"
                        aria-hidden="true"
                      >
                        {step.icon}
                      </span>
                    </span>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                      {step.step}
                    </p>
                  </div>
                  <h3 className="mt-5 text-3xl font-extrabold tracking-tight text-on-background sm:text-4xl">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-lg leading-relaxed text-on-surface-variant">
                    {step.description}
                  </p>
                </div>

                <div className={imageFirst ? "lg:order-1" : undefined}>
                  <div className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-[0_24px_60px_-44px_rgba(15,23,42,0.55)]">
                    <div className="relative flex min-h-[280px] items-center justify-center bg-surface-container-low p-3 sm:min-h-[360px] sm:p-5">
                      <Image
                        src={step.image}
                        alt={step.imageAlt}
                        width={step.imageWidth}
                        height={step.imageHeight}
                        sizes="(min-width: 1024px) 560px, calc(100vw - 48px)"
                        className="max-h-[520px] w-full rounded-xl object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 border-t border-outline-variant/50 pt-8 text-center">
          <p className="text-base font-medium leading-relaxed text-on-surface-variant">
            Run a sample order through Packwell{" "}
            <Link
              href="/demo"
              className="inline-flex items-center font-bold text-primary underline-offset-4 transition-colors hover:text-primary-container hover:underline"
            >
              in the interactive demo
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
