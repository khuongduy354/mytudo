import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCreateListing } from "../hooks/useListings";
import { wardrobeApi } from "../../../api";
import type { ListingCondition } from "@mytudo/shared";
import styles from "./SellItemPage.module.css";

const CONDITIONS: { value: ListingCondition; label: string }[] = [
  { value: "new", label: "Mới 100%" },
  { value: "like_new", label: "Như mới" },
  { value: "used", label: "Đã sử dụng" },
];

export function SellItemPage() {
  const { wardrobeItemId } = useParams<{ wardrobeItemId: string }>();
  const navigate = useNavigate();

  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<ListingCondition>("like_new");
  const [description, setDescription] = useState("");

  const {
    data: itemData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wardrobe-item", wardrobeItemId],
    queryFn: () => wardrobeApi.getWardrobeItemById(wardrobeItemId!),
    enabled: !!wardrobeItemId,
  });

  const createListing = useCreateListing();

  const item = itemData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wardrobeItemId || !price) return;

    try {
      await createListing.mutateAsync({
        wardrobeItemId,
        price: Number(price),
        condition,
        description: description || undefined,
      });
      alert("Đã đăng bán thành công!");
      navigate("/my-listings");
    } catch {
      alert("Không thể đăng bán. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error || !item) {
    return <div className={styles.error}>Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>
        ← Quay lại tủ đồ
      </Link>

      <div className={styles.header}>
        <h1>💰 Đăng bán</h1>
        <p>Đặt giá và mô tả cho sản phẩm của bạn</p>
      </div>

      <div className={styles.itemPreview}>
        <div className={styles.itemImage}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name ?? "Sản phẩm"} />
          ) : (
            <div className={styles.noImage}>👗</div>
          )}
        </div>
        <div className={styles.itemInfo}>
          <h3 className={styles.itemName}>{item.name ?? "Không tên"}</h3>
          <span className={styles.itemCategory}>{item.category}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Giá bán *</label>
          <div className={styles.priceInput}>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150000"
              min="0"
              required
            />
            <span className={styles.currency}>VNĐ</span>
          </div>
          <span className={styles.hint}>
            Gợi ý: Đặt giá hợp lý để bán nhanh hơn
          </span>
        </div>

        <div className={styles.formGroup}>
          <label>Tình trạng *</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as ListingCondition)}
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Mô tả (tùy chọn)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả tình trạng, lý do bán, thông tin thêm..."
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={createListing.isPending || !price}
        >
          {createListing.isPending ? "Đang đăng..." : "Đăng bán ngay"}
        </button>
      </form>
    </div>
  );
}
