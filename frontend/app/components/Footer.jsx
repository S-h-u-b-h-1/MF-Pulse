export default function Footer({ note }) {
  return (
    <footer className="container-px mt-16 border-t border-line py-8 text-center text-[12px] leading-relaxed text-ink-faint">
      {note}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>Built with Next.js · Supabase · data ©</span>
        <a className="text-ink-muted hover:text-ink" href="https://www.amfiindia.com">AMFI</a>
        <span>·</span>
        <a className="text-ink-muted hover:text-ink" href="/about">About</a>
        <span>·</span>
        <a className="text-ink-muted hover:text-ink" href="/methodology">Methodology</a>
        <span>·</span>
        <a className="text-ink-muted hover:text-ink" href="/status">Status</a>
        <span>·</span>
        <a className="text-ink-muted hover:text-ink" href="https://github.com/S-h-u-b-h-1/MF-Pulse">Source</a>
      </div>
    </footer>
  );
}
