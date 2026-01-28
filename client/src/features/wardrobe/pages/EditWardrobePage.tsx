import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useWardrobeById, useUpdateWardrobe } from "../hooks/useWardrobe";
import type { WardrobeVisibility } from "@/shared";
import styles from "./EditWardrobePage.module.css";

export function EditWardrobePage() {
  const { wardrobeId } = useParams<{ wardrobeId: string }>();
  const navigate = useNavigate();
  const { data: wardrobe, isLoading, error } = useWardrobeById(wardrobeId);
  const updateMutation = useUpdateWardrobe();

  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<WardrobeVisibility>("private");

  useEffect(() => {
    if (wardrobe) {
      setName(wardrobe.name);
      setVisibility(wardrobe.visibility);
    }
  }, [wardrobe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardrobeId || !name.trim()) return;

    try {
      await updateMutation.mutateAsync({
        id: wardrobeId,
        data: { name: name.trim(), visibility },
      });
      navigate("/wardrobes");
    } catch (err) {
      alert("Không thể cập nhật tủ đồ. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error || !wardrobe) {
    return (
      <div className={styles.error}>
        <p>Không tìm thấy tủ đồ.</p>
        <Link to="/wardrobes" className={styles.backLink}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/wardrobes" className={styles.backLink}>
        Quay lại
      </Link>

      <div className={styles.header}>
        <h1>Chỉnh sửa tủ đồ</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>
            Tên tủ đồ <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Tủ đồ công sở"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Hiển thị</label>
          <select
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as WardrobeVisibility)
            }
          >
            <option value="private">Riêng tư</option>
            <option value="public">Công khai</option>
          </select>
          <span className={styles.hint}>
            {visibility === "public"
              ? "Sản phẩm từ tủ đồ này có thể được đăng bán"
              : "Chỉ bạn có thể xem tủ đồ này"}
          </span>
        </div>

        {wardrobe.itemCount !== undefined && wardrobe.itemCount > 0 && (
          <div className={styles.infoBox}>
            Tủ đồ này hiện có {wardrobe.itemCount} sản phẩm
          </div>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={updateMutation.isPending || !name.trim()}
        >
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
