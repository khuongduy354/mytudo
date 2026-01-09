import { Link } from "react-router-dom";
import { useWishlist, useRemoveFromWishlist } from "../hooks/useWishlist";
import styles from "./WishlistPage.module.css";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function WishlistPage() {
  const { data, isLoading, error } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const wishlistItems = data?.data || [];

  const handleRemove = async (wishlistId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await removeFromWishlist.mutateAsync(wishlistId);
    } catch {
      alert("Không thể xóa. Vui lòng thử lại.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>❤️ Yêu thích</h1>
      </div>

      {isLoading && <div className={styles.loading}>Đang tải...</div>}

      {error && (
        <div className={styles.error}>
          Không thể tải danh sách. Vui lòng thử lại.
        </div>
      )}

      {!isLoading && !error && wishlistItems.length === 0 && (
        <div className={styles.empty}>
          <p>Bạn chưa lưu sản phẩm yêu thích nào.</p>
          <Link to="/marketplace" className={styles.browseLink}>
            Khám phá chợ đồ →
          </Link>
        </div>
      )}

      {!isLoading && !error && wishlistItems.length > 0 && (
        <div className={styles.grid}>
          {wishlistItems.map((item) => {
            const listing = item.listing;
            const isUnavailable = listing?.status !== "active";

            return (
              <div
                key={item.id}
                className={`${styles.wishlistCard} ${
                  isUnavailable ? styles.unavailable : ""
                }`}
              >
                <button
                  className={styles.removeBtn}
                  onClick={(e) => handleRemove(item.id, e)}
                  title="Xóa khỏi yêu thích"
                >
                  ✕
                </button>

                {isUnavailable && (
                  <span className={styles.unavailableBadge}>
                    {listing?.status === "sold" ? "Đã bán" : "Không còn"}
                  </span>
                )}

                <Link
                  to={listing ? `/listing/${listing.id}` : "#"}
                  className={styles.cardLink}
                >
                  <div className={styles.imageWrapper}>
                    {listing?.wardrobeItem?.imageUrl ? (
                      <img
                        src={listing.wardrobeItem.imageUrl}
                        alt={listing.wardrobeItem.name ?? "Sản phẩm"}
                      />
                    ) : (
                      <div className={styles.noImage}>👗</div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>
                      {listing?.wardrobeItem?.name ?? "Không tên"}
                    </h3>
                    <p className={styles.cardCategory}>
                      {listing?.wardrobeItem?.category}
                    </p>
                    {listing && (
                      <p className={styles.cardPrice}>
                        {formatPrice(listing.price)}
                      </p>
                    )}
                    {listing?.seller && (
                      <p className={styles.sellerName}>
                        👤 {listing.seller.fullName}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
