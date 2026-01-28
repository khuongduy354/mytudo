import { useState } from "react";
import { Link } from "react-router-dom";
import { useWardrobe } from "../hooks/useWardrobe";
import { ITEM_CATEGORIES, CATEGORY_LABELS, type ItemCategory } from "@/shared";
import styles from "./WardrobePage.module.css";

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

export function WardrobePage() {
  const [selectedCategory, setSelectedCategory] = useState<
    ItemCategory | undefined
  >();
  const { data, isLoading } = useWardrobe({ category: selectedCategory });

  const items = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Tủ đồ của tôi <span className={styles.count}>({total})</span>
        </h1>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${
            !selectedCategory ? styles.active : ""
          }`}
          onClick={() => setSelectedCategory(undefined)}
        >
          Tất cả
        </button>
        {ITEM_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${
              selectedCategory === cat ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}></div>
          <p className={styles.emptyText}>Tủ đồ trống</p>
          <p className={styles.emptySubtext}>
            Thêm món đồ đầu tiên để bắt đầu số hóa tủ đồ!
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/wardrobe/${item.id}`}
              className={styles.itemCardWrapper}
            >
              <div className={styles.itemCard}>
                {item.hasListing && (
                  <span className={styles.listingBadge}>Đang bán</span>
                )}
                <img
                  src={item.imageUrl}
                  alt={item.name || CATEGORY_LABELS[item.category]}
                  className={styles.itemImage}
                />
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>
                    {item.name || CATEGORY_LABELS[item.category]}
                  </div>
                  <div className={styles.itemMeta}>
                    <span
                      className={styles.colorDot}
                      style={{
                        backgroundColor: COLOR_MAP[item.color] || item.color,
                      }}
                    />
                    {item.brand && <span>{item.brand}</span>}
                    {item.size && <span>• {item.size}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link to="/wardrobe/add">
        <button className={styles.addButton}>+</button>
      </Link>
    </div>
  );
}
