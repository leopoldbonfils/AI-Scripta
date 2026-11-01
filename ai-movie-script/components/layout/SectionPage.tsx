import Link from "next/link";

export function SectionPage({ title, eyebrow, description }: { title: string; eyebrow: string; description: string }) {
  return (
    <div className="section-page">
      <section className="section-page-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="primary-button" href="/create">+ Start a new production</Link>
      </section>
    </div>
  );
}
