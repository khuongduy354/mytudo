import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import styles from "./Layout.module.css";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link to="/">👗 MYTuDo</Link>
        </div>
        <nav className={styles.nav}>
          <Link to="/">Tủ đồ</Link>
          <Link to="/marketplace">Chợ đồ</Link>
          <Link to="/my-listings">Đang bán</Link>
          <Link to="/wishlist">Yêu thích</Link>
        </nav>
        <div className={styles.userSection}>
          <Link to="/profile" className={styles.userName}>
            {user?.fullName || "Tài khoản"}
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Đăng xuất
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
