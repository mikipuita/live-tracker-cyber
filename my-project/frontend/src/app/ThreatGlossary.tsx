type Entry = { term: string; blurb: string };

type AccentKey = 'cyan' | 'ember' | 'violet';

const ACCENT: Record<
  AccentKey,
  { cardHover: string; chip: string; titleHover: string }
> = {
  cyan: {
    cardHover:
      'hover:border-cyan-500/45 hover:ring-cyan-500/35 hover:bg-cyan-950/40 hover:shadow-[0_8px_36px_-14px_rgba(34,211,238,0.28)]',
    chip:
      'text-zinc-500 ring-white/10 group-hover:bg-cyan-950/60 group-hover:text-cyan-200 group-hover:ring-cyan-500/40',
    titleHover: 'group-hover:text-cyan-50',
  },
  ember: {
    cardHover:
      'hover:border-orange-400/45 hover:ring-rose-500/35 hover:bg-rose-950/35 hover:shadow-[0_8px_36px_-14px_rgba(251,113,133,0.22)]',
    chip:
      'text-zinc-500 ring-white/10 group-hover:bg-rose-950/55 group-hover:text-orange-200 group-hover:ring-orange-400/40',
    titleHover: 'group-hover:text-orange-50',
  },
  violet: {
    cardHover:
      'hover:border-violet-500/45 hover:ring-fuchsia-500/35 hover:bg-violet-950/40 hover:shadow-[0_8px_36px_-14px_rgba(167,139,250,0.25)]',
    chip:
      'text-zinc-500 ring-white/10 group-hover:bg-violet-950/55 group-hover:text-violet-200 group-hover:ring-violet-500/45',
    titleHover: 'group-hover:text-violet-50',
  },
};

const GROUPS: {
  title: string;
  lede: string;
  pro: string;
  stripe: string;
  glow: string;
  accent: AccentKey;
  items: Entry[];
  layout: 'grid' | 'featured';
}[] = [
  {
    title: 'Attacks & campaigns',
    lede: 'Ways someone tries to knock a service down, fool a person, or break in by guessing.',
    pro: 'Availability hits, social engineering, credential guessing, scripted / bot-driven abuse.',
    stripe: 'from-cyan-400 via-cyan-500 to-teal-600',
    glow: 'bg-cyan-500/10',
    accent: 'cyan',
    layout: 'featured',
    items: [
      {
        term: 'DDoS',
        blurb:
          'A flood of traffic aimed at overwhelming a site or service so normal users cannot reach it.',
      },
      {
        term: 'Phishing',
        blurb:
          'Deceptive messages or pages that try to trick people into handing over passwords or personal data.',
      },
      {
        term: 'Brute force',
        blurb: 'Repeated automated guessing of passwords or keys until one works.',
      },
      {
        term: 'Bot / malicious bot',
        blurb:
          'Automated software doing harmful tasks at scale, such as spam or credential stuffing.',
      },
    ],
  },
  {
    title: 'Malware & takeovers',
    lede: 'Bad software on a device, or a machine an attacker already runs.',
    pro: 'Malicious code families, extortion payloads, and already-owned hosts in a campaign.',
    stripe: 'from-rose-400 via-orange-500 to-amber-600',
    glow: 'bg-rose-500/10',
    accent: 'ember',
    layout: 'grid',
    items: [
      {
        term: 'Malware',
        blurb:
          'Malicious software: viruses, spyware, ransomware, and similar programs that harm devices or steal data.',
      },
      {
        term: 'Ransomware',
        blurb:
          'Malware that encrypts files or locks systems until a payment is made (often demanded in cryptocurrency).',
      },
      {
        term: 'Compromised host',
        blurb:
          'A computer or server that an attacker already controls and may use for further abuse.',
      },
    ],
  },
  {
    title: 'Weak spots & probes',
    lede: 'Known software bugs, poking at what is exposed on a network, and tricking apps into leaking data.',
    pro: 'Cataloged CVEs, recon / service discovery, classic injection and unsafe query paths.',
    stripe: 'from-violet-400 via-fuchsia-500 to-indigo-600',
    glow: 'bg-violet-500/10',
    accent: 'violet',
    layout: 'grid',
    items: [
      {
        term: 'CVE',
        blurb:
          'A public identifier for a known software vulnerability, often paired with a severity score.',
      },
      {
        term: 'Port scan',
        blurb:
          'Probing a network to see which services or “doors” are exposed and might be attacked.',
      },
      {
        term: 'SQL injection',
        blurb:
          'Abusing a web form or URL to run unintended database commands against an application.',
      },
    ],
  },
];

function TermChip({ term, chipClassName }: { term: string; chipClassName: string }) {
  const initial = term.replace(/[^a-zA-Z]/g, '').slice(0, 1).toUpperCase() || '?';
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/95 font-mono text-xs font-bold ring-1 transition-all duration-200 ${chipClassName}`}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function GlossaryTermCard({
  entry,
  accentKey,
}: {
  entry: Entry;
  accentKey: AccentKey;
}) {
  const a = ACCENT[accentKey];
  return (
    <div
      className={`group cursor-pointer rounded-xl border border-white/[0.08] bg-zinc-950/50 p-4 ring-1 ring-white/[0.04] transition-all duration-200 ease-out ${a.cardHover}`}
    >
      <div className="flex gap-3">
        <TermChip term={entry.term} chipClassName={a.chip} />
        <div className="min-w-0 flex-1">
          <h4
            className={`font-sans text-sm font-semibold text-zinc-100 transition-colors duration-200 ${a.titleHover}`}
          >
            {entry.term}
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400">
            {entry.blurb}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ThreatGlossary() {
  return (
    <section className="relative mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/50 ring-1 ring-white/[0.04]">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-cyan-500/[0.06] blur-3xl"
        aria-hidden
      />

      <div className="relative border-b border-white/[0.06] bg-gradient-to-br from-zinc-900/80 via-zinc-950/90 to-cyan-950/20 px-6 py-7 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-500/80">
              Reference
            </p>
            <h2 className="mt-2 font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Threat terms in plain language
            </h2>
          </div>
          <p className="max-w-[200px] text-right text-[11px] font-normal leading-snug text-zinc-600/55 sm:max-w-xs sm:text-xs sm:text-zinc-600/50">
            Short summaries only. In practice each topic runs much deeper than this.
          </p>
        </div>
      </div>

      <div className="relative space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {GROUPS.map((group) => (
          <div
            key={group.title}
            className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/35 ${group.glow} ring-1 ring-white/[0.03]`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${group.stripe}`}
              aria-hidden
            />
            <div className="pl-5 pr-4 py-5 sm:pl-6 sm:pr-5">
              <h3 className="font-sans text-sm font-semibold text-zinc-100">{group.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{group.lede}</p>
              <p className="mt-1 text-[11px] leading-snug text-zinc-600">{group.pro}</p>

              {group.layout === 'featured' ? (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.items.map((entry) => (
                    <GlossaryTermCard key={entry.term} entry={entry} accentKey={group.accent} />
                  ))}
                </div>
              ) : (
                <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {group.items.map((entry) => (
                    <li key={entry.term}>
                      <GlossaryTermCard entry={entry} accentKey={group.accent} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
