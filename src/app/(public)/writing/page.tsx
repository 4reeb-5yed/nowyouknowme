import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Writing",
  description: "Blog and writing — coming soon.",
};

export default function WritingPage() {
  return (
    <main className="section section--canvas">
      <div className="container">
        <div className="section-header section-header--centered">
          <p className="section-kicker">// 07 — Blog</p>
          <h1 className="section-title">Writing</h1>
          <p className="section-description">
            Articles on systems engineering, cloud infrastructure, and product development. Coming soon.
          </p>
        </div>

        <div className="writing-page-coming-soon">
          <p>More content coming soon.</p>
        </div>

        <div className="section-footer">
          <Link href="/#contact" className="btn btn--text">
            Want to discuss a topic?
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
