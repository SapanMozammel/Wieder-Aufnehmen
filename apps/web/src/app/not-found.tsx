import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main id="main-content" className="page-shell status-page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>This address does not point to a page in your application.</p>
      <Link className="button" href="/">
        Back to home
      </Link>
    </main>
  );
}
