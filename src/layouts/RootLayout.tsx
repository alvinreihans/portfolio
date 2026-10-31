import { Link, Outlet, ScrollRestoration } from 'react-router';

// Scaffold only: navbar, footer, theme, and i18n arrive in later slices (specs/04-pages.md).
export function RootLayout() {
  return (
    <>
      <header className="bg-nav">
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link to="/" className="font-bold">
            alvinreihans
          </Link>
          <Link to="/cv">CV</Link>
        </nav>
      </header>
      <main id="content" className="mx-auto max-w-[1200px] px-6 py-16">
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  );
}
