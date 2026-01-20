import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import logoImage from "../../mytudo-logo.jpeg";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img src={logoImage} alt="MYTuDo" className="h-10 w-auto" />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Tủ đồ
                </Link>
                <Link
                  to="/wardrobes"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Quản lý tủ
                </Link>
                <Link
                  to="/marketplace"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Chợ đồ
                </Link>
                <Link
                  to="/my-listings"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Đang bán
                </Link>
                <Link
                  to="/wishlist"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Yêu thích
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {user?.fullName || "Tài khoản"}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
