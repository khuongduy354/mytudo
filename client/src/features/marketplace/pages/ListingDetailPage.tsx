import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListingDetail } from "../hooks/useMarketplace";
import { wishlistApi } from "../../../api";
import styles from "./ListingDetailPage.module.css";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function ListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useListingDetail(listingId || "");
  const listing = data?.data;

  const addToWishlist = useMutation({
    mutationFn: () => wishlistApi.addToWishlist(listingId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      alert("Đã thêm vào danh sách yêu thích!");
    },
    onError: () => {
      alert("Không thể thêm. Có thể bạn đã thêm sản phẩm này rồi.");
    },
  });

  if (isLoading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error || !listing) {
    return <div className={styles.error}>Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className={styles.container}>
      <Link to="/marketplace" className={styles.backLink}>
        ← Quay lại chợ đồ
      </Link>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          {listing.wardrobeItem?.imageUrl ? (
            <img
              src={listing.wardrobeItem.imageUrl}
              alt={listing.wardrobeItem.name ?? "Sản phẩm"}
            />
          ) : (
            <div className={styles.noImage}></div>
          )}
        </div>

        <div className={styles.details}>
          <span className={styles.category}>
            {listing.wardrobeItem?.category}
          </span>
          <h1 className={styles.title}>
            {listing.wardrobeItem?.name || "Không tên"}
          </h1>
          <p className={styles.price}>{formatPrice(listing.price)}</p>

          {listing.description && (
            <p className={styles.description}>{listing.description}</p>
          )}

          <div className={styles.meta}>
            {listing.wardrobeItem?.brand && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Thương hiệu</span>
                <span className={styles.metaValue}>
                  {listing.wardrobeItem.brand}
                </span>
              </div>
            )}
            {listing.wardrobeItem?.size && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Size</span>
                <span className={styles.metaValue}>
                  {listing.wardrobeItem.size}
                </span>
              </div>
            )}
            {listing.wardrobeItem?.color && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Màu</span>
                <span className={styles.metaValue}>
                  {listing.wardrobeItem.color}
                </span>
              </div>
            )}
          </div>

          {listing.seller && (
            <div className={styles.seller}>
              <div className={styles.sellerAvatar}></div>
              <div className={styles.sellerInfo}>
                <span className={styles.sellerLabel}>Người bán</span>
                <span className={styles.sellerName}>
                  {listing.seller.fullName}
                </span>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.wishlistBtn}
              onClick={() => addToWishlist.mutate()}
              disabled={addToWishlist.isPending}
            >
              Yêu thích
            </button>
            <button className={styles.contactBtn}>Liên hệ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
