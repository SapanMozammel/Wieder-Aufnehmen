'use client';

export default function ErrorPage({ reset }: { readonly reset: () => void }) {
  return (
    <main id="main-content" className="page-shell status-page">
      <h1>Something went wrong</h1>
      <p>We could not finish loading this page. Try again to continue.</p>
      <button type="button" className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
