import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useWardrobe } from "../../wardrobe/hooks/useWardrobe";
import { useMyListings } from "../../listings/hooks/useListings";
import styles from "./ProfilePage.module.css";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, isLoading: authLoading } = useAuth();
  const { data: wardrobeData } = useWardrobe();
  const { data: listingsData } = useMyListings();

  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user?.fullName]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile({ fullName: fullName.trim() });
      alert("Đã cập nhật thông tin!");
    } catch {
      alert("Không thể cập nhật. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const wardrobeCount = wardrobeData?.data?.length || 0;
  const activeListings =
    listingsData?.data?.filter((l) => l.status === "active").length || 0;
  const soldListings =
    listingsData?.data?.filter((l) => l.status === "sold").length || 0;

  if (authLoading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>👤</div>
        <h1>{user?.fullName || "Người dùng"}</h1>
        <p className={styles.phone}>{user?.phone}</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{wardrobeCount}</span>
          <span className={styles.statLabel}>Tủ đồ</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{activeListings}</span>
          <span className={styles.statLabel}>Đang bán</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{soldListings}</span>
          <span className={styles.statLabel}>Đã bán</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📝 Thông tin cá nhân</h3>

        <div className={styles.formGroup}>
          <label>Số điện thoại</label>
          <input type="tel" value={user?.phone || ""} disabled />
        </div>

        <div className={styles.formGroup}>
          <label>Họ tên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ tên của bạn"
          />
        </div>

        <button
          className={styles.saveBtn}
          onClick={handleSaveProfile}
          disabled={isSaving || !fullName.trim()}
        >
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>⚙️ Cài đặt</h3>

        <div className={styles.menuItem}>
          <div className={styles.menuItemLeft}>
            <span className={styles.menuIcon}>🔔</span>
            <span className={styles.menuLabel}>Thông báo</span>
          </div>
          <span className={styles.menuArrow}>›</span>
        </div>

        <div className={styles.menuItem}>
          <div className={styles.menuItemLeft}>
            <span className={styles.menuIcon}>🔒</span>
            <span className={styles.menuLabel}>Bảo mật</span>
          </div>
          <span className={styles.menuArrow}>›</span>
        </div>

        <div className={styles.menuItem}>
          <div className={styles.menuItemLeft}>
            <span className={styles.menuIcon}>❓</span>
            <span className={styles.menuLabel}>Trợ giúp</span>
          </div>
          <span className={styles.menuArrow}>›</span>
        </div>
      </div>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
}
