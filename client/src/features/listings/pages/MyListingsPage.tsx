import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyListings, useUpdateListing } from "../hooks/useListings";
import { CATEGORY_LABELS, type ListingStatus } from "@mytudo/shared";
import styles from "./MyListingsPage.module.css";

const STATUS_TABS: { value: ListingStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang bán" },
  { value: "sold", label: "Đã bán" },
  { value: "cancelled", label: "Đã hủy" },
];

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export function MyListingsPage() {
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "all">(
    "all"
  );

  const { data, isLoading, error } = useMyListings();
  const updateListing = useUpdateListing();

  const allListings = data?.data || [];
  const listings =
    statusFilter === "all"
      ? allListings
      : allListings.filter((l) => l.status === statusFilter);

  const handleCancel = async (listingId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đăng bán sản phẩm này?")) return;

    try {
      await updateListing.mutateAsync({
        id: listingId,
        data: { status: "cancelled" },
      });
    } catch {
      alert("Không thể hủy. Vui lòng thử lại.");
    }
  };

  const handleMarkSold = async (listingId: string) => {
    if (!confirm("Xác nhận đã bán sản phẩm này?")) return;

    try {
      await updateListing.mutateAsync({
        id: listingId,
        data: { status: "sold" },
      });
    } catch {
      alert("Không thể cập nhật. Vui lòng thử lại.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Đang bán</h1>
      </div>

      <div className={styles.statusTabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.statusTab} ${
              statusFilter === tab.value ? styles.active : ""
            }`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <div className={styles.loading}>Đang tải...</div>}

      {error && (
        <div className={styles.error}>
          Không thể tải danh sách. Vui lòng thử lại.
        </div>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <div className={styles.empty}>
          <p>Bạn chưa đăng bán sản phẩm nào.</p>
          <Link to="/" className={styles.addLink}>
            Bắt đầu bán từ tủ đồ →
          </Link>
        </div>
      )}

      {!isLoading && !error && listings.length > 0 && (
        <div className={styles.grid}>
          {listings.map((listing) => (
            <div key={listing.id} className={styles.listingCard}>
              <div className={styles.imageWrapper}>
                {listing.wardrobeItem?.imageUrl ? (
                  <img
                    src={listing.wardrobeItem.imageUrl}
                    alt={listing.wardrobeItem.name ?? "Sản phẩm"}
                  />
                ) : (
                  <div className={styles.noImage}></div>
                )}
                <span
                  className={`${styles.statusBadge} ${styles[listing.status]}`}
                >
                  {listing.status === "active"
                    ? "Đang bán"
                    : listing.status === "sold"
                    ? "Đã bán"
                    : "Đã hủy"}
                </span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>
                  {listing.wardrobeItem?.name ||
                    (listing.wardrobeItem?.category
                      ? CATEGORY_LABELS[listing.wardrobeItem.category]
                      : "Không tên")}
                </h3>
                <p className={styles.cardPrice}>{formatPrice(listing.price)}</p>
                <div className={styles.cardMeta}>
                  {listing.wardrobeItem?.color && (
                    <span
                      className={styles.colorDot}
                      style={{
                        backgroundColor:
                          COLOR_MAP[listing.wardrobeItem.color] ||
                          listing.wardrobeItem.color,
                      }}
                    />
                  )}
                  {listing.wardrobeItem?.brand && (
                    <span>{listing.wardrobeItem.brand}</span>
                  )}
                  {listing.wardrobeItem?.size && (
                    <span>• {listing.wardrobeItem.size}</span>
                  )}
                </div>
                <p className={styles.cardDate}>
                  Đăng ngày {formatDate(listing.createdAt)}
                </p>

                {listing.status === "active" && (
                  <div className={styles.cardActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleMarkSold(listing.id)}
                      disabled={updateListing.isPending}
                    >
                      Đã bán
                    </button>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => handleCancel(listing.id)}
                      disabled={updateListing.isPending}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
