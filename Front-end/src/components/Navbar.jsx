import React from 'react';

/**
 * Navbar Component
 * Top navigation bar with MaCare logo and navigation links
 * Responsive design with mobile menu
 */
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">
                MaCare
              </h1>
              <p className="text-xs text-gray-600">মা ও শিশু যত্ন</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#home" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              হোম
            </a>
            <a href="#features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              সেবাসমূহ
            </a>
            <a href="#about" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              আমাদের সম্পর্কে
            </a>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              লগইন
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#home" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              হোম
            </a>
            <a href="#features" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              সেবাসমূহ
            </a>
            <a href="#about" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              আমাদের সম্পর্কে
            </a>
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-base font-medium mt-2">
              লগইন
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
