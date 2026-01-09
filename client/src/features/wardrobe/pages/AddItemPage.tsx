import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { useCreateWardrobeItem } from "../hooks/useWardrobe";
import { uploadApi } from "../../../api/upload.api";
import {
  ITEM_CATEGORIES,
  CATEGORY_LABELS,
  COMMON_COLORS,
  type ItemCategory,
} from "@mytudo/shared";
import styles from "./AddItemPage.module.css";

const CATEGORY_ICONS: Record<ItemCategory, string> = {
  tops: "👕",
  bottoms: "👖",
  footwear: "👟",
  accessories: "👜",
};

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

export function AddItemPage() {
  const navigate = useNavigate();
  const createMutation = useCreateWardrobeItem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!imageFile) {
      setError("Vui lòng chọn ảnh");
      return;
    }
    if (!category) {
      setError("Vui lòng chọn danh mục");
      return;
    }
    if (!color) {
      setError("Vui lòng chọn màu sắc");
      return;
    }

    try {
      setIsUploading(true);

      // Upload image first
      const imageUrl = await uploadApi.uploadImage(imageFile);

      // Create wardrobe item
      await createMutation.mutateAsync({
        imageUrl,
        category,
        color,
        name: name || undefined,
        brand: brand || undefined,
        size: size || undefined,
        material: material || undefined,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      });

      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Không thể thêm sản phẩm");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className={styles.title}>Thêm món đồ</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
          />

          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className={styles.imagePreview}
            />
          ) : (
            <div
              className={styles.imagePlaceholder}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className={styles.placeholderIcon}>📷</span>
              <span className={styles.placeholderText}>
                Chọn ảnh từ thư viện
              </span>
            </div>
          )}

          {imagePreview && (
            <div className={styles.imageActions}>
              <button
                type="button"
                className={styles.imageActionBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn ảnh khác
              </button>
            </div>
          )}
        </div>

        <div className={styles.form}>
          {/* Category */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Danh mục <span className={styles.required}>*</span>
            </label>
            <div className={styles.categoryGrid}>
              {ITEM_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.categoryBtn} ${
                    category === cat ? styles.selected : ""
                  }`}
                  onClick={() => setCategory(cat)}
                >
                  <div className={styles.categoryIcon}>
                    {CATEGORY_ICONS[cat]}
                  </div>
                  <div className={styles.categoryLabel}>
                    {CATEGORY_LABELS[cat]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Màu sắc <span className={styles.required}>*</span>
            </label>
            <div className={styles.colorGrid}>
              {COMMON_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorBtn} ${
                    color === c ? styles.selected : ""
                  } ${c === "white" ? styles.white : ""}`}
                  style={{ backgroundColor: COLOR_MAP[c] || c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Optional fields */}
          <Input
            label="Tên sản phẩm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Áo sơ mi trắng công sở"
          />

          <Input
            label="Thương hiệu"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="VD: Zara, H&M, Uniqlo"
          />

          <Input
            label="Size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="VD: S, M, L, 38, 40"
          />

          <Input
            label="Chất liệu"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="VD: Cotton, Linen, Polyester"
          />

          <Input
            label="Giá mua (VNĐ)"
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="VD: 500000"
          />

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <Button
              type="submit"
              isLoading={isUploading || createMutation.isPending}
            >
              Thêm vào tủ đồ
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Hủy
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
