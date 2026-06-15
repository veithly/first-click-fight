import { NavLink as Link } from "@/components/NavLink";

export function TopBar({ crumb }: { crumb?: string }) {
  return (
    <>
      <header className="topbar">
        <Link href="/" aria-label="First-Click Fight home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/wordmark.svg" alt="First-Click Fight" className="wordmark" />
        </Link>
        <nav aria-label="Primary">
          <Link href="/app/new">Start a fight</Link>
          <Link href="/about">How it works</Link>
        </nav>
      </header>
      {crumb && (
        <p className="crumbs">
          <Link href="/">home</Link> / {crumb}
        </p>
      )}
    </>
  );
}
