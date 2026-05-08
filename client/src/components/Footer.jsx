export default function Footer() {
  return (
    <footer className="mt-10">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="glass rounded-3xl px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="font-semibold">GenoPredict</p>
              <p className="text-gp_muted mt-1">
                © {new Date().getFullYear()} GenoPredict. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6 text-gp_muted">
              <a className="hover:text-gp_text" href="#">Privacy</a>
              <a className="hover:text-gp_text" href="#">Terms</a>
              <a className="hover:text-gp_text" href="#">Contact</a>
            </div>
          </div>
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-xs text-gp_muted mt-4">
            This is a frontend-only prototype. Authentication and data processing will be added later.
          </p>
        </div>
      </div>
      <div className="h-10" />
    </footer>
  );
}
