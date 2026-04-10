'use client';

import { useEffect, useCallback, useState } from 'react';
import { useDashboard } from './DashboardContext';
import type { Threat } from '../types/threat';

type Entry = {
  term: string;
  blurb: string;
  example: string;
  matchTypes: string[];   // substrings matched against threat.type (lowercase)
  matchDetails?: boolean; // also scan threat.details for CVE IDs
};

type AccentKey = 'cyan' | 'ember' | 'violet' | 'indigo';

const ACCENT: Record<AccentKey, { cardHover: string; chip: string; titleHover: string; modalRing: string }> = {
  cyan: {
    cardHover: 'hover:border-cyan-500/45 hover:ring-cyan-500/35 hover:bg-cyan-950/40 hover:shadow-[0_8px_36px_-14px_rgba(34,211,238,0.28)]',
    chip: 'text-zinc-500 ring-white/10 group-hover:bg-cyan-950/60 group-hover:text-cyan-200 group-hover:ring-cyan-500/40',
    titleHover: 'group-hover:text-cyan-50',
    modalRing: 'border-cyan-500/25 shadow-[0_0_60px_-20px_rgba(34,211,238,0.2)]',
  },
  ember: {
    cardHover: 'hover:border-orange-400/45 hover:ring-rose-500/35 hover:bg-rose-950/35 hover:shadow-[0_8px_36px_-14px_rgba(251,113,133,0.22)]',
    chip: 'text-zinc-500 ring-white/10 group-hover:bg-rose-950/55 group-hover:text-orange-200 group-hover:ring-orange-400/40',
    titleHover: 'group-hover:text-orange-50',
    modalRing: 'border-orange-500/25 shadow-[0_0_60px_-20px_rgba(251,113,133,0.2)]',
  },
  violet: {
    cardHover: 'hover:border-violet-500/45 hover:ring-fuchsia-500/35 hover:bg-violet-950/40 hover:shadow-[0_8px_36px_-14px_rgba(167,139,250,0.25)]',
    chip: 'text-zinc-500 ring-white/10 group-hover:bg-violet-950/55 group-hover:text-violet-200 group-hover:ring-violet-500/45',
    titleHover: 'group-hover:text-violet-50',
    modalRing: 'border-violet-500/25 shadow-[0_0_60px_-20px_rgba(167,139,250,0.2)]',
  },
  indigo: {
    cardHover: 'hover:border-indigo-500/45 hover:ring-indigo-500/35 hover:bg-indigo-950/40 hover:shadow-[0_8px_36px_-14px_rgba(99,102,241,0.28)]',
    chip: 'text-zinc-500 ring-white/10 group-hover:bg-indigo-950/60 group-hover:text-indigo-200 group-hover:ring-indigo-500/40',
    titleHover: 'group-hover:text-indigo-50',
    modalRing: 'border-indigo-500/25 shadow-[0_0_60px_-20px_rgba(99,102,241,0.2)]',
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
        blurb: 'A flood of traffic aimed at overwhelming a site or service so normal users cannot reach it.',
        example: 'A botnet sends millions of requests per second to a web server until it stops responding.',
        matchTypes: ['ddos', 'denial of service', 'ping of death'],
      },
      {
        term: 'Phishing',
        blurb: 'Deceptive messages or pages that try to trick people into handing over passwords or personal data.',
        example: 'An email mimicking your bank asks you to "verify your account" via a fake login page.',
        matchTypes: ['phishing', 'email spoof', 'fraud attempt'],
      },
      {
        term: 'Brute force',
        blurb: 'Repeated automated guessing of passwords or keys until one works.',
        example: 'A script tries thousands of common passwords against an SSH port until it gains access.',
        matchTypes: ['brute force'],
      },
      {
        term: 'Bot / malicious bot',
        blurb: 'Automated software doing harmful tasks at scale, such as spam or credential stuffing.',
        example: 'A bot submits stolen username/password pairs across thousands of sites to find reused credentials.',
        matchTypes: ['malicious bot', 'web spam', 'bot'],
      },
      {
        term: 'SSH attack',
        blurb: 'Unauthorized attempts to gain shell access to a server over SSH, usually via brute force or stolen keys.',
        example: 'An attacker hammers port 22 with a dictionary of common username/password combos.',
        matchTypes: ['ssh attack', 'ssh abuse'],
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
        blurb: 'Malicious software: viruses, spyware, ransomware, and similar programs that harm devices or steal data.',
        example: 'A trojan disguised as a PDF installer quietly opens a backdoor on the victim\'s machine.',
        matchTypes: ['malware'],
      },
      {
        term: 'Ransomware',
        blurb: 'Malware that encrypts files or locks systems until a payment is made (often demanded in cryptocurrency).',
        example: 'A hospital\'s file system is encrypted overnight; attackers demand payment to restore patient records.',
        matchTypes: ['ransomware'],
      },
      {
        term: 'Compromised host',
        blurb: 'A computer or server that an attacker already controls and may use for further abuse.',
        example: 'A web server is quietly used to relay phishing emails or scan other networks without the owner knowing.',
        matchTypes: ['compromised host', 'hacking attempt', 'exploited'],
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
        blurb: 'A public identifier for a known software vulnerability, often paired with a severity score.',
        example: 'CVE-2021-44228 (Log4Shell) allowed attackers to run arbitrary code on any server using Log4j.',
        matchTypes: [],
        matchDetails: true,
      },
      {
        term: 'Port scan',
        blurb: 'Probing a network to see which services or "doors" are exposed and might be attacked.',
        example: 'A scanner sweeps a company\'s IP range looking for open RDP ports before launching a brute-force.',
        matchTypes: ['port scan'],
      },
      {
        term: 'SQL injection',
        blurb: 'Abusing a web form or URL to run unintended database commands against an application.',
        example: 'Entering `\' OR 1=1 --` into a login form bypasses authentication by manipulating the SQL query.',
        matchTypes: ['sql injection'],
      },
      {
        term: 'Remote code execution',
        blurb: 'A vulnerability that lets an attacker run arbitrary code on a target system without physical access.',
        example: 'A crafted HTTP request triggers a buffer overflow in a web server, giving the attacker a remote shell.',
        matchTypes: ['remote code execution'],
      },
      {
        term: 'Cross-site scripting',
        blurb: 'Injecting malicious scripts into a web page viewed by other users to steal sessions or redirect them.',
        example: 'A comment field accepts raw HTML; an attacker posts a script that steals cookies of anyone who views it.',
        matchTypes: ['cross-site scripting', 'xss'],
      },
      {
        term: 'Memory corruption',
        blurb: 'Bugs that let attackers overwrite program memory — buffer overflows, heap errors, use-after-free.',
        example: 'Writing more data than a buffer can hold overwrites adjacent memory, redirecting program execution.',
        matchTypes: ['memory corruption', 'buffer overflow', 'use-after-free', 'heap', 'insecure deserialization'],
      },
    ],
  },
  {
    title: 'Access & escalation',
    lede: 'Gaining footholds, moving deeper into systems, and leaking what should stay private.',
    pro: 'Privilege abuse, auth flaws, path manipulation, and sensitive data walking out the door.',
    stripe: 'from-indigo-400 via-blue-500 to-sky-600',
    glow: 'bg-indigo-500/10',
    accent: 'indigo',
    layout: 'grid',
    items: [
      {
        term: 'Privilege escalation',
        blurb: 'Gaining higher permissions than initially granted — moving from user to admin, or from app to OS.',
        example: 'A low-privilege user exploits a misconfigured sudo rule to get full root access on a Linux server.',
        matchTypes: ['privilege escalation'],
      },
      {
        term: 'Authentication bypass',
        blurb: 'Circumventing a login or identity check to access resources without valid credentials.',
        example: 'A JWT token with a forged signature is accepted because the server doesn\'t verify it correctly.',
        matchTypes: ['authentication bypass'],
      },
      {
        term: 'Command injection',
        blurb: 'Passing shell commands through user input that gets executed by the server\'s operating system.',
        example: 'A filename input field accepts `; rm -rf /` and the server runs it as a system command.',
        matchTypes: ['command injection'],
      },
      {
        term: 'Path traversal',
        blurb: 'Using `../` sequences in file paths to read files outside the intended directory.',
        example: 'A download endpoint accepts `../../etc/passwd` and returns the server\'s user list.',
        matchTypes: ['path traversal'],
      },
      {
        term: 'Information disclosure',
        blurb: 'Unintentional exposure of sensitive data — credentials, internal paths, user records.',
        example: 'A misconfigured API returns full database rows including password hashes to unauthenticated requests.',
        matchTypes: ['information disclosure'],
      },
    ],
  },
];

function extractBufferData(threats: Threat[], matchTypes: string[], matchDetails: boolean) {
  const matched =
    matchTypes.length === 0 && matchDetails
      ? threats.filter((t) => t.details && /CVE-\d{4}-\d+/i.test(t.details))
      : threats.filter((t) =>
          matchTypes.some((mt) => t.type.toLowerCase().includes(mt)),
        );

  const cveSet = new Set<string>();
  for (const t of matched) {
    if (t.details) {
      const m = t.details.match(/CVE-\d{4}-\d+/i);
      if (m) cveSet.add(m[0].toUpperCase());
    }
  }
  return { count: matched.length, cveIds: [...cveSet].slice(0, 6) };
}

type SelectedEntry = Entry & { accentKey: AccentKey };

function TermModal({ entry, onClose }: { entry: SelectedEntry; onClose: () => void }) {
  const { threats, feedPaused } = useDashboard();
  const a = ACCENT[entry.accentKey];
  const { count, cveIds } = extractBufferData(threats, entry.matchTypes, !!entry.matchDetails);

  const handleClose = useCallback(onClose, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal aria-label={`${entry.term} — threat definition`}>
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border bg-zinc-950 p-6 shadow-2xl ${a.modalRing}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 ring-1 ring-white/10 transition-colors hover:bg-zinc-700/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Threat term
        </p>
        <h3 className="mt-2 font-sans text-xl font-semibold tracking-tight text-white">
          {entry.term}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{entry.blurb}</p>

        <div className="mt-5 rounded-xl border border-white/[0.07] bg-zinc-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Example</p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">{entry.example}</p>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Live buffer
          </p>
          {feedPaused ? (
            <p className="mt-2 text-xs text-zinc-600">Feed is disconnected. Connect the stream to see live matches.</p>
          ) : count === 0 ? (
            <p className="mt-2 text-xs text-zinc-600">No events matching this term in the current buffer yet.</p>
          ) : (
            <>
              <p className="mt-2 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200">{count}</span> event{count === 1 ? '' : 's'} in current buffer
              </p>
              {cveIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {cveIds.map((id) => (
                    <a
                      key={id}
                      href={`https://nvd.nist.gov/vuln/detail/${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-zinc-800/80 px-2.5 py-1 font-mono text-[11px] text-cyan-400/90 ring-1 ring-cyan-500/20 transition-colors hover:bg-cyan-950/50 hover:text-cyan-300 hover:ring-cyan-500/40"
                    >
                      {id} ↗
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
  onClick,
}: {
  entry: Entry;
  accentKey: AccentKey;
  onClick: () => void;
}) {
  const a = ACCENT[accentKey];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full cursor-pointer rounded-xl border border-white/[0.08] bg-zinc-950/50 p-4 text-left ring-1 ring-white/[0.04] transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${a.cardHover}`}
    >
      <div className="flex gap-3">
        <TermChip term={entry.term} chipClassName={a.chip} />
        <div className="min-w-0 flex-1">
          <h4 className={`font-sans text-sm font-semibold text-zinc-100 transition-colors duration-200 ${a.titleHover}`}>
            {entry.term}
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400">
            {entry.blurb}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function ThreatGlossary() {
  const [selected, setSelected] = useState<SelectedEntry | null>(null);

  return (
    <>
      {selected && (
        <TermModal entry={selected} onClose={() => setSelected(null)} />
      )}

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
              Click any term for a definition, example, and live CVE matches.
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
              <div className="py-5 pl-5 pr-4 sm:pl-6 sm:pr-5">
                <h3 className="font-sans text-sm font-semibold text-zinc-100">{group.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{group.lede}</p>
                <p className="mt-1 text-[11px] leading-snug text-zinc-600">{group.pro}</p>

                {group.layout === 'featured' ? (
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {group.items.map((entry) => (
                      <GlossaryTermCard
                        key={entry.term}
                        entry={entry}
                        accentKey={group.accent}
                        onClick={() => setSelected({ ...entry, accentKey: group.accent })}
                      />
                    ))}
                  </div>
                ) : (
                  <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {group.items.map((entry) => (
                      <li key={entry.term}>
                        <GlossaryTermCard
                          entry={entry}
                          accentKey={group.accent}
                          onClick={() => setSelected({ ...entry, accentKey: group.accent })}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
