import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useWardrobes,
  useCreateWardrobe,
  useDeleteWardrobe,
} from "../hooks/useWardrobe";
import type { WardrobeVisibility } from "@mytudo/shared";
import styles from "./WardrobesPage.module.css";

export function WardrobesPage() {
  const { data: wardrobes, isLoading, error } = useWardrobes();
  const createMutation = useCreateWardrobe();
  const deleteMutation = useDeleteWardrobe();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<WardrobeVisibility>("private");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createMutation.mutateAsync({ name: name.trim(), visibility });
      setName("");
      setVisibility("private");
      setShowCreateForm(false);
    } catch (err) {
      alert("Không thể tạo tủ đồ. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (id: string, wardrobeName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tủ đồ "${wardrobeName}"?`)) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      alert("Không thể xóa tủ đồ. Có thể tủ đồ còn chứa sản phẩm.");
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error) {
    return <div className={styles.error}>Không thể tải danh sách tủ đồ.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Quản lý tủ đồ</h1>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Hủy" : "Tạo tủ đồ mới"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className={styles.createForm}>
          <div className={styles.formGroup}>
            <label>Tên tủ đồ</label>
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

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={createMutation.isPending || !name.trim()}
          >
            {createMutation.isPending ? "Đang tạo..." : "Tạo tủ đồ"}
          </button>
        </form>
      )}

      <div className={styles.list}>
        {!wardrobes || wardrobes.length === 0 ? (
          <div className={styles.empty}>
            <p>Bạn chưa có tủ đồ nào.</p>
          </div>
        ) : (
          wardrobes.map((wardrobe) => (
            <div key={wardrobe.id} className={styles.wardrobeCard}>
              <div className={styles.wardrobeInfo}>
                <h3>{wardrobe.name}</h3>
                <div className={styles.meta}>
                  <span
                    className={`${styles.visibility} ${
                      wardrobe.visibility === "public"
                        ? styles.public
                        : styles.private
                    }`}
                  >
                    {wardrobe.visibility === "public"
                      ? "Công khai"
                      : "Riêng tư"}
                  </span>
                  {wardrobe.itemCount !== undefined && (
                    <span className={styles.itemCount}>
                      {wardrobe.itemCount} sản phẩm
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                <Link
                  to={`/wardrobes/${wardrobe.id}/edit`}
                  className={styles.editBtn}
                >
                  Sửa
                </Link>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(wardrobe.id, wardrobe.name)}
                  disabled={deleteMutation.isPending}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
