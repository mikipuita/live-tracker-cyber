'use client';

import type { ReactNode } from 'react';

const variants = {
  stream: {
    bar: 'from-cyan-400 via-fuchsia-500/70 to-violet-600/50',
    orbTL: 'bg-cyan-500/[0.14]',
    orbBR: 'bg-fuchsia-500/[0.1]',
    eyebrowTint: 'text-cyan-400/85',
  },
  analytics: {
    bar: 'from-violet-400 via-cyan-400/80 to-emerald-500/45',
    orbTL: 'bg-violet-500/[0.15]',
    orbBR: 'bg-cyan-500/[0.08]',
    eyebrowTint: 'text-violet-400/85',
  },
  geo: {
    bar: 'from-emerald-400 via-teal-500/75 to-cyan-500/50',
    orbTL: 'bg-emerald-500/[0.16]',
    orbBR: 'bg-teal-500/[0.09]',
    eyebrowTint: 'text-emerald-400/85',
  },
} as const;

export type InsightVariant = keyof typeof variants;

export function InsightPanelShell({
  variant,
  eyebrow,
  title,
  description,
  meta,
  headerRight,
  banner,
  bodyClassName,
  children,
}: {
  variant: InsightVariant;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  headerRight?: ReactNode;
  banner?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const v = variants[variant];
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-zinc-950/75 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.07] backdrop-blur-md">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r ${v.bar}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full ${v.orbTL} blur-3xl`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full ${v.orbBR} blur-3xl`}
        aria-hidden
      />

      <div className="relative px-5 pb-5 pt-7 sm:px-6 sm:pb-6 sm:pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="min-w-0 flex-1">
            <p
              className={`font-mono text-[10px] font-semibold uppercase tracking-[0.28em] ${v.eyebrowTint}`}
            >
              {eyebrow}
            </p>
            <h2 className="mt-2.5 bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text font-sans text-xl font-semibold tracking-tight text-transparent sm:text-2xl">
              {title}
            </h2>
            {description ? (
              <div className="mt-3 max-w-prose text-xs leading-relaxed text-zinc-400">{description}</div>
            ) : null}
            {meta ? <div className="mt-2.5">{meta}</div> : null}
          </div>
          {headerRight ? <div className="shrink-0 pt-1">{headerRight}</div> : null}
        </div>

        {banner}

        <div className={bodyClassName ?? 'mt-5'}>{children}</div>
      </div>
    </section>
  );
}
