'use client';

export function Header() {
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-black sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            INGREDIA
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#intro" className="text-gray-400 font-bold hover:text-gray-300 transition-colors text-sm">
              ABOUT
            </a>
            <a href="#contact" onClick={handleContactClick} className="text-gray-400 font-bold hover:text-gray-300 transition-colors text-sm cursor-pointer">
              CONTACT
            </a>
          </nav>

          <button className="md:hidden p-2 hover:bg-gray-800 rounded transition-colors">
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
