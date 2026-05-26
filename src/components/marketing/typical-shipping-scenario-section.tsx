import Image from "next/image";

const shippingMismatchItems = [
  {
    name: "Backpack",
    weight: "1 lb.",
    dimensions: "13 x 8 x 14 in",
    image: "/marketing/backpack.png",
  },
  {
    name: "Mug",
    weight: "2.33 lbs.",
    dimensions: "5.4 x 5.4 x 6.1 in",
    image: "/marketing/mug.png",
  },
  {
    name: "Notebook",
    weight: "0.63 lbs.",
    dimensions: "5 x 8 x 0.5 in",
    image: "/marketing/notebook.png",
  },
];

export function TypicalShippingScenarioSection() {
  return (
    <section className="px-6 py-24 md:py-32 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto">
        <div className="mx-auto max-w-3xl text-center" data-reveal="up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-on-background leading-tight">
            A Typical Shipping Scenario
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
            Why shipping quotes don&apos;t match what you&apos;re actually charged
          </p>
        </div>

        <div className="mt-14 rounded-3xl border border-outline-variant/50 bg-surface shadow-[0_24px_60px_-44px_rgba(15,23,42,0.55)] overflow-hidden" data-reveal="up">
          <div className="border-b border-outline-variant/50 bg-surface-container-low px-5 py-5 sm:px-7 lg:px-9">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                  Example order
                </p>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-on-background sm:text-3xl">
                  Backpack + Mug + Notebook
                </h3>
              </div>
              <p className="text-sm font-semibold text-on-surface-variant sm:text-base">
                Denver <span aria-hidden="true">-&gt;</span> New York
              </p>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/40">
            {shippingMismatchItems.map((item) => (
              <div
                key={item.name}
                className="grid gap-4 px-5 py-5 sm:px-7 md:grid-cols-[minmax(0,1.3fr)_minmax(140px,0.7fr)_minmax(190px,0.9fr)] md:items-center lg:px-9"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-container">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xl font-bold tracking-tight text-on-background sm:text-2xl">
                    {item.name}
                  </p>
                </div>
                <div className="grid grid-cols-[minmax(4.5rem,0.65fr)_minmax(0,1fr)] gap-4 md:contents">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                      Weight
                    </p>
                    <p className="mt-1 text-lg font-bold text-on-background">{item.weight}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                      Dimensions
                    </p>
                    <p className="mt-1 text-lg font-bold text-on-background">{item.dimensions}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-reveal="up">
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low p-6 sm:p-8">
            <div className="mb-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Checkout quote
                </p>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-on-background">
                  Based on real weight of products
                </h3>
              </div>
              <span className="material-symbols-outlined text-[28px] text-on-surface-variant" aria-hidden="true">
                warning
              </span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <p className="text-lg font-semibold text-on-surface-variant">UPS Ground</p>
              <p className="text-4xl font-extrabold tracking-tight text-on-background">$23.63</p>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low p-6 sm:p-8">
            <div className="mb-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Carrier invoice
                </p>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-on-background">
                  Based on real and volumetric weight
                </h3>
              </div>
              <span className="material-symbols-outlined text-[28px] text-on-surface-variant" aria-hidden="true">
                receipt_long
              </span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <p className="text-lg font-semibold text-on-surface-variant">UPS Ground</p>
              <p className="text-4xl font-extrabold tracking-tight text-on-background">$53.28</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1fr)] lg:items-center" data-reveal="up">
          <div className="rounded-2xl border border-error/20 bg-error-container/25 p-6 text-error sm:p-8">
            <p className="text-xl font-extrabold tracking-tight">Loss on one order: $29.65</p>
            <p className="mt-3 text-lg font-bold">Loss on 100 orders: ~$3,000</p>
            <p className="mt-2 text-lg font-bold">Loss on 3,000 orders: ~$89,000</p>
          </div>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            Packwell automatically selects the right box from available packaging
            options based on product dimensions, so your checkout shipping price matches
            what the carrier will charge.
          </p>
        </div>
      </div>
    </section>
  );
}
