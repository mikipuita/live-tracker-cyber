function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconKey({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.5 13.5 19 5M16 5h3v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M21 12a9 9 0 0 1-9 9 4.5 4.5 0 0 1-4.5-4.5V15M3 12a9 9 0 0 1 9-9 4.5 4.5 0 0 1 4.5 4.5V9" strokeLinecap="round" />
      <path d="M8 15H3v5M21 9v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PRIORITIES = [
  {
    title: 'Use MFA',
    text: 'Add a second step (app or key) on email, banking, and social. Passwords alone are not enough.',
    Icon: IconShield,
    accent: 'from-emerald-400/20 to-cyan-500/10',
    ring: 'ring-emerald-500/25',
  },
  {
    title: 'Unique passwords',
    text: 'Use a password manager so every account gets its own strong password. Reuse is what attackers count on.',
    Icon: IconKey,
    accent: 'from-violet-400/20 to-fuchsia-500/10',
    ring: 'ring-violet-500/25',
  },
  {
    title: 'Stay updated',
    text: 'Turn on auto-updates for OS and browsers. Patches close the holes malware and scams exploit.',
    Icon: IconRefresh,
    accent: 'from-amber-400/15 to-orange-500/10',
    ring: 'ring-amber-500/25',
  },
] as const;

export default function PersonalSafetyGuide() {
  return (
    <section className="relative mt-12 overflow-hidden rounded-2xl border border-emerald-500/15 bg-zinc-950/60 shadow-[0_0_0_1px_rgba(16,185,129,0.06)]">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/[0.07] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyan-500/[0.06] blur-3xl"
        aria-hidden
      />

      <div className="relative border-b border-white/[0.06] bg-gradient-to-r from-emerald-950/40 via-transparent to-cyan-950/30 px-6 py-6 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
          Beyond the dashboard
        </p>
        <h2 className="mt-2 font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Lower your odds of being the easy target
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Watching threat feeds is interesting; these habits are what actually move the needle for most
          people. None of this replaces professional advice for a real incident. It is everyday
          hygiene.
        </p>
      </div>

      <div className="relative px-6 py-8 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Start here</p>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PRIORITIES.map(({ title, text, Icon, accent, ring }) => (
            <div
              key={title}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${accent} p-[1px] ring-1 ${ring}`}
            >
              <div className="flex h-full flex-col rounded-[11px] bg-zinc-950/85 p-4 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900/90 text-emerald-400 ring-1 ring-white/10">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-sans text-base font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[11px] leading-relaxed text-zinc-600">
          This panel is general guidance only. If you believe you are compromised, contact your IT team,
          bank, or local authorities using official channels, not links from unsolicited messages.
        </p>
      </div>
    </section>
  );
}
