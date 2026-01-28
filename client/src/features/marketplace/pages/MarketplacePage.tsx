import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMarketplace } from "../hooks/useMarketplace";
import { wishlistApi } from "../../../api";
import type { ItemCategory } from "@/shared";
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
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useMarketplace({
    category: category || undefined,
    status: "active",
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  const addToWishlist = useMutation({
    mutationFn: (listingId: string) => wishlistApi.addToWishlist(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      refetch();
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: (listingId: string) =>
      wishlistApi.removeFromWishlist(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      refetch();
    },
  });

  const handleWishlistToggle = (
    e: React.MouseEvent,
    listingId: string,
    isWishlisted: boolean,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist.mutate(listingId);
    } else {
      addToWishlist.mutate(listingId);
    }
  };

  const listings = data?.data || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Chợ đồ</h1>
      </div>

      <div className="filters">
        <div className="filterGroup">
          <label>Loại đồ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ItemCategory | "")}
            className="select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="priceRangeGroup">
          <label>Khoảng giá (VND)</label>
          <div className="priceInputs">
            <input
              type="number"
              placeholder="Từ"
              value={minPrice}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value) || 0);
                setMinPrice(value.toString());
              }}
              min="0"
              className="priceInput"
            />
            <span className="priceSeparator">-</span>
            <input
              type="number"
              placeholder="Đến"
              value={maxPrice}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value) || 0);
                setMaxPrice(value.toString());
              }}
              min="0"
              className="priceInput"
            />
          </div>
          <div className="sliderContainer">
            <input
              type="range"
              min="0"
              max="5000000"
              step="50000"
              value={minPrice || 0}
              onChange={(e) => {
                const value = Math.min(
                  Number(e.target.value),
                  Number(maxPrice) || 5000000,
                );
                setMinPrice(value.toString());
              }}
              className="rangeSlider rangeSliderMin"
            />
            <input
              type="range"
              min="0"
              max="5000000"
              step="50000"
              value={maxPrice || 5000000}
              onChange={(e) => {
                const value = Math.max(
                  Number(e.target.value),
                  Number(minPrice) || 0,
                );
                setMaxPrice(value.toString());
              }}
              className="rangeSlider rangeSliderMax"
            />
          </div>
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
                  <div className={styles.noImage}></div>
                )}
                <button
                  className={`${styles.wishlistBtn} ${
                    listing.isWishlisted ? styles.wishlisted : ""
                  }`}
                  onClick={(e) =>
                    handleWishlistToggle(
                      e,
                      listing.id,
                      listing.isWishlisted || false,
                    )
                  }
                  disabled={
                    addToWishlist.isPending || removeFromWishlist.isPending
                  }
                >
                  {listing.isWishlisted ? "♥" : "♡"}
                </button>
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
                    <span>{listing.seller.fullName}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .filters {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background: white;
          border-radius: 16px;
          border: 1px solid hsl(var(--border));
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .filterGroup {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 150px;
        }

        .filterGroup label {
          font-size: 0.875rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .filterGroup select,
        .select {
          padding: 0.625rem 0.875rem;
          border: 1.5px solid hsl(var(--border));
          border-radius: 12px;
          background: white;
          font-size: 0.875rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .filterGroup select:hover,
        .select:hover {
          border-color: hsl(var(--primary) / 0.5);
        }

        .filterGroup select:focus,
        .select:focus {
          outline: none;
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
        }

        .priceRangeGroup {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
          min-width: 280px;
        }

        .priceRangeGroup label {
          font-size: 0.875rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .priceInputs {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .priceInput {
          flex: 1;
          padding: 0.625rem 0.875rem;
          border: 1.5px solid hsl(var(--border));
          border-radius: 12px;
          font-size: 0.875rem;
          transition: all 0.2s;
          background: white;
        }

        .priceInput:hover {
          border-color: hsl(var(--primary) / 0.5);
        }

        .priceInput:focus {
          outline: none;
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
        }

        .priceSeparator {
          color: hsl(var(--muted-foreground));
          font-weight: 600;
        }

        .sliderContainer {
          position: relative;
          height: 40px;
          display: flex;
          align-items: center;
        }

        .rangeSlider {
          position: absolute;
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          pointer-events: none;
        }

        .rangeSlider::-webkit-slider-track {
          width: 100%;
          height: 6px;
          background: hsl(var(--muted));
          border-radius: 3px;
        }

        .rangeSlider::-moz-range-track {
          width: 100%;
          height: 6px;
          background: hsl(var(--muted));
          border-radius: 3px;
        }

        .rangeSlider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: hsl(var(--primary));
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: all;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .rangeSlider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: hsl(var(--primary));
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: all;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .rangeSlider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        }

        .rangeSlider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        }

        .rangeSliderMax::-webkit-slider-thumb {
          background: hsl(var(--accent));
        }

        .rangeSliderMax::-moz-range-thumb {
          background: hsl(var(--accent));
        }

        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
            gap: 1rem;
          }

          .filterGroup,
          .priceRangeGroup {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
