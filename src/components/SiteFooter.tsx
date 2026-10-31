export function SiteFooter() {
  return (
    <footer className="theme-fade bg-footer text-footer-ink">
      <div className="mx-auto max-w-[1200px] px-6 py-8 text-sm">
        © {new Date().getFullYear()} alvinreihans
      </div>
    </footer>
  );
}
