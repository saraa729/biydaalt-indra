interface NavbarProps {
  isAdminMode: boolean;
  onToggleAdmin: () => void;
}

function Navbar({ isAdminMode, onToggleAdmin }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/30 bg-[#0A0E17]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
        <a href="#top" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold">
            I
          </div>
          <span className="text-2xl font-bold tracking-wide">INDRA CYBER</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#programs" className="text-sm font-semibold tracking-wide text-gray-400 transition hover:text-blue-300">
            PROGRAMS
          </a>
          <a href="#admissions" className="text-sm font-semibold tracking-wide text-gray-400 transition hover:text-blue-300">
            ADMISSIONS
          </a>
          <a
            href="#announcements"
            className="text-sm font-semibold tracking-wide text-gray-400 transition hover:text-blue-300"
          >
            ANNOUNCEMENTS
          </a>
          <a href="#news" className="text-sm font-semibold tracking-wide text-gray-400 transition hover:text-blue-300">
            NEWS
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleAdmin}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isAdminMode
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20 hover:from-purple-600 hover:to-pink-700'
            }`}
          >
            {isAdminMode ? 'EXIT ADMIN' : 'ADMIN PANEL'}
          </button>
          <button className="hidden rounded-lg border border-blue-400 px-6 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-400/10 md:block">
            LOGIN
          </button>
          <button className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2 font-semibold shadow-lg shadow-blue-500/20 transition hover:from-blue-600 hover:to-indigo-700">
            ENROLL NOW
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
