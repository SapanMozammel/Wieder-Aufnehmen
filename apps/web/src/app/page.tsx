import Link from 'next/link';

const foundations = [
  {
    number: '01',
    title: 'Clear boundaries',
    description:
      'A Next.js frontend, an Express API and MongoDB adapters connected by shared, validated contracts.',
  },
  {
    number: '02',
    title: 'Checks that travel with you',
    description:
      'Formatting, strict types, architecture checks and regression tests run through the same commands locally and in CI.',
  },
  {
    number: '03',
    title: 'One workflow, many tools',
    description:
      'Repository instructions, task records and review evidence make work portable between your preferred AI tools.',
  },
] as const;

export default function HomePage() {
  return (
    <main id="main-content" className="page-shell">
      <section className="hero" aria-labelledby="welcome-heading">
        <p className="eyebrow">Your next project starts here</p>
        <h1 id="welcome-heading">
          A solid foundation.
          <br />
          <span className="muted">Room for your ideas.</span>
        </h1>
        <p className="hero-description">
          Aufnehmen brings the MENN stack and a shared AI development workflow together. Add your
          product on a foundation you can understand, test and maintain.
        </p>
        <div className="actions">
          <Link className="button" href="/system-status">
            Check your environment <span aria-hidden="true">↗</span>
          </Link>
          <a className="text-link" href="https://github.com/SapanMozammel/Aufnehmen#readme">
            Read the setup guide
          </a>
        </div>
      </section>
      <section className="foundation-grid" aria-label="Included foundations">
        {foundations.map((foundation) => (
          <article className="foundation-card" key={foundation.number}>
            <span className="card-number" aria-hidden="true">
              {foundation.number}
            </span>
            <h2>{foundation.title}</h2>
            <p>{foundation.description}</p>
          </article>
        ))}
      </section>
      <aside className="next-step" aria-label="Next step">
        <p>
          <strong>Make it yours.</strong> Start with the repository’s README, then create a task
          through <code>AGENTS.md</code>. This starter contains infrastructure and a system-status
          example; your application’s business features are yours to define.
        </p>
      </aside>
    </main>
  );
}
