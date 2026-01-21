import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import logoImage from "../../mytudo-logo-removebg-preview.png";
import { useState } from "react";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Tủ đồ" },
    { to: "/wardrobes", label: "Quản lý tủ" },
    { to: "/marketplace", label: "Chợ đồ" },
    { to: "/my-listings", label: "Đang bán" },
    { to: "/wishlist", label: "Yêu thích" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Eco-modern navbar with organic feel */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-primary/10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group transition-transform hover:scale-105 duration-300"
            >
              <img 
                src={logoImage} 
                alt="MYTuDo" 
                className="h-12 w-auto drop-shadow-sm group-hover:drop-shadow-md transition-all" 
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive(link.to)
                      ? "text-black bg-primary shadow-md"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300"
              >
                <span>Tài khoản</span>
                {user?.fullName && <span className="hidden md:inline">({user.fullName})</span>}
              </Link>
              
              <button
                onClick={handleLogout}
                className="sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-black bg-gradient-to-r from-primary to-accent hover:shadow-md hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span>Đăng xuất</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-full text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 pt-2 animate-fade-in">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      isActive(link.to)
                        ? "text-black bg-primary/10 shadow-md"
                        : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="sm:hidden px-4 py-3 rounded-2xl text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  Tài khoản {user?.fullName && `(${user.fullName})`}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="sm:hidden px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
                >
                  Đăng xuất
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main content with organic spacing */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
