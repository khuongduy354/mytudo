import { Link, useParams, useNavigate } from "react-router-dom";
import { useWardrobeItem, useDeleteWardrobeItem } from "../hooks/useWardrobe";
import { CATEGORY_LABELS } from "@/shared";
import styles from "./WardrobeItemDetailPage.module.css";

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  gray: "#808080",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  pink: "#ec4899",
  purple: "#a855f7",
  orange: "#f97316",
  brown: "#a16207",
  beige: "#d4b896",
  navy: "#1e3a5f",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function WardrobeItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, error } = useWardrobeItem(itemId);
  const deleteMutation = useDeleteWardrobeItem();

  const handleDelete = async () => {
    if (!itemId) return;
    if (!confirm("Bạn có chắc muốn xóa món đồ này?")) return;

    try {
      await deleteMutation.mutateAsync(itemId);
      navigate("/");
    } catch {
      alert("Không thể xóa. Có thể món đồ đang được đăng bán.");
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error || !item) {
    return (
      <div className={styles.error}>
        <p>Không tìm thấy món đồ.</p>
        <Link to="/" className={styles.backLink}>
          ← Quay lại tủ đồ
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>
        ← Quay lại tủ đồ
      </Link>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <img
            src={item.imageUrl}
            alt={item.name || CATEGORY_LABELS[item.category]}
          />
          {item.hasListing && (
            <span className={styles.listingBadge}>Đang bán</span>
          )}
        </div>

        <div className={styles.details}>
          <span className={styles.category}>
            {CATEGORY_LABELS[item.category]}
          </span>
          <h1 className={styles.title}>
            {item.name || CATEGORY_LABELS[item.category]}
          </h1>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Màu sắc</span>
              <span className={styles.metaValue}>
                <span
                  className={styles.colorDot}
                  style={{
                    backgroundColor: COLOR_MAP[item.color] || item.color,
                  }}
                />
                {item.color}
              </span>
            </div>

            {item.brand && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Thương hiệu</span>
                <span className={styles.metaValue}>{item.brand}</span>
              </div>
            )}

            {item.size && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Size</span>
                <span className={styles.metaValue}>{item.size}</span>
              </div>
            )}

            {item.material && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Chất liệu</span>
                <span className={styles.metaValue}>{item.material}</span>
              </div>
            )}

            {item.purchasePrice && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Giá mua</span>
                <span className={styles.metaValue}>
                  {formatPrice(item.purchasePrice)}
                </span>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {!item.hasListing && (
              <Link to={`/sell/${item.id}`} className={styles.sellBtn}>
                Đăng bán
              </Link>
            )}
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={deleteMutation.isPending || item.hasListing}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
