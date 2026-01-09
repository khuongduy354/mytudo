import { useState } from "react";
import { Link } from "react-router-dom";
import { useMarketplace } from "../hooks/useMarketplace";
import type { ItemCategory } from "@mytudo/shared";
import styles from "./MarketplacePage.module.css";

const CATEGORIES: { value: ItemCategory | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "tops", label: "Áo" },
  { value: "bottoms", label: "Quần" },
  { value: "footwear", label: "Giày" },
  { value: "accessories", label: "Phụ kiện" },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function MarketplacePage() {
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const { data, isLoading, error } = useMarketplace({
    category: category || undefined,
    status: "active",
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  const listings = data?.data || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🛒 Chợ đồ</h1>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Loại đồ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ItemCategory | "")}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Giá từ</label>
          <input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Đến</label>
          <input
            type="number"
            placeholder="Không giới hạn"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <div className={styles.loading}>Đang tải...</div>}

      {error && (
        <div className={styles.error}>
          Không thể tải danh sách. Vui lòng thử lại.
        </div>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <div className={styles.empty}>
          <p>Chưa có sản phẩm nào được đăng bán.</p>
        </div>
      )}

      {!isLoading && !error && listings.length > 0 && (
        <div className={styles.grid}>
          {listings.map((listing) => (
            <Link
              key={listing.id}
              to={`/listing/${listing.id}`}
              className={styles.listingCard}
            >
              <div className={styles.imageWrapper}>
                {listing.wardrobeItem?.imageUrl ? (
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
                  {listing.wardrobeItem?.name ?? "Không tên"}
                </h3>
                <p className={styles.cardCategory}>
                  {listing.wardrobeItem?.category}
                </p>
                <p className={styles.cardPrice}>{formatPrice(listing.price)}</p>
                {listing.seller && (
                  <div className={styles.seller}>
                    <span>👤</span>
                    <span>{listing.seller.fullName}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
