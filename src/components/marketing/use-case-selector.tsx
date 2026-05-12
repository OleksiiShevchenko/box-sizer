"use client";

import Image from "next/image";
import { useState } from "react";

export type MarketingUseCase = {
  icon: string;
  title: string;
  helper: string;
  desc: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

type UseCaseSelectorProps = {
  useCases: MarketingUseCase[];
};

export function UseCaseSelector({ useCases }: UseCaseSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!useCases.length) {
    return null;
  }

  const selectedUseCase = useCases[selectedIndex];

  const selectUseCase = (index: number) => {
    if (index === selectedIndex) {
      return;
    }
    setSelectedIndex(index);
  };

  return (
    <div className="mt-14 md:mt-16" data-testid="use-case-selector">
      <div
        className="hidden grid-cols-2 items-stretch gap-8 lg:grid"
        data-testid="use-case-desktop"
      >
        <div
          className="flex flex-col gap-4"
          role="tablist"
          aria-label="Use cases"
        >
          {useCases.map((useCase, index) => {
            const isActive = index === selectedIndex;

            return (
              <button
                key={useCase.title}
                type="button"
                role="tab"
                id={`use-case-tab-${index}`}
                aria-selected={isActive}
                aria-controls="use-case-detail"
                onClick={() => selectUseCase(index)}
                className={[
                  "group flex min-h-[92px] w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                  "hover:border-primary/45 hover:bg-surface-container-lowest hover:shadow-[0_12px_26px_-24px_rgba(37,99,235,0.75)] hover:ring-2 hover:ring-primary/10",
                  isActive
                    ? "border-primary/70 bg-primary-fixed/35"
                    : "border-outline-variant/45 bg-white text-on-surface-variant",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive ? "bg-primary text-white" : "bg-transparent",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "material-symbols-outlined text-[22px]",
                      isActive ? "text-white" : "text-primary",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {useCase.icon}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={[
                      "block text-lg font-bold leading-snug transition-colors",
                      isActive ? "text-on-background" : "text-on-surface",
                    ].join(" ")}
                  >
                    {useCase.title}
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-on-surface-variant">
                    {useCase.helper}
                  </span>
                </span>
                <span
                  className={[
                    "material-symbols-outlined shrink-0 text-[20px] transition-all duration-200",
                    isActive
                      ? "translate-x-0 text-primary opacity-100"
                      : "-translate-x-1 text-outline opacity-0 group-hover:translate-x-0 group-hover:opacity-70",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </button>
            );
          })}
        </div>

        <article
          id="use-case-detail"
          data-testid="use-case-detail"
          role="tabpanel"
          aria-labelledby={`use-case-tab-${selectedIndex}`}
          className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-outline-variant/40 bg-white"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-container">
            {useCases.map((useCase, index) => (
              <Image
                key={useCase.title}
                src={useCase.image.src}
                alt={useCase.image.alt}
                width={useCase.image.width}
                height={useCase.image.height}
                sizes="(min-width: 1024px) 50vw, 100vw"
                quality={90}
                priority={index === 0}
                className={[
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out",
                  index === selectedIndex ? "opacity-100" : "opacity-0",
                ].join(" ")}
                aria-hidden={index !== selectedIndex}
              />
            ))}
          </div>

          <div className="p-8">
            <h3 className="text-3xl font-bold leading-tight tracking-tight text-on-background">
              {selectedUseCase.title}
            </h3>

            <p className="mt-7 max-w-[620px] text-lg leading-relaxed text-on-surface-variant">
              {selectedUseCase.desc}
            </p>
          </div>
        </article>
      </div>

      <div className="space-y-4 lg:hidden" data-testid="use-case-mobile">
        {useCases.map((useCase, index) => {
          const isActive = index === selectedIndex;
          const panelId = `use-case-mobile-panel-${index}`;

          return (
            <div
              key={useCase.title}
              className={[
                "overflow-hidden rounded-xl border bg-white transition-all duration-200",
                isActive
                  ? "border-primary/50 shadow-[0_18px_42px_-34px_rgba(37,99,235,0.7)]"
                  : "border-outline-variant/45",
              ].join(" ")}
            >
              <button
                type="button"
                aria-expanded={isActive}
                aria-controls={panelId}
                onClick={() => selectUseCase(index)}
                className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-surface-container-lowest"
              >
                <span
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                    isActive ? "bg-primary text-white" : "bg-transparent",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "material-symbols-outlined",
                      isActive ? "text-white" : "text-primary",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {useCase.icon}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold leading-snug text-on-background">
                    {useCase.title}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-on-surface-variant">
                    {useCase.helper}
                  </span>
                </span>
                <span
                  className={[
                    "material-symbols-outlined text-on-surface-variant transition-transform duration-200",
                    isActive ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </button>
              <div
                id={panelId}
                className={[
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                  isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-container">
                    <Image
                      src={useCase.image.src}
                      alt={useCase.image.alt}
                      width={useCase.image.width}
                      height={useCase.image.height}
                      sizes="100vw"
                      quality={90}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="px-5 pb-6 pt-5 text-sm leading-relaxed text-on-surface-variant">
                    {useCase.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
