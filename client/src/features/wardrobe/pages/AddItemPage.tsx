import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { useCreateWardrobeItem, useWardrobes } from "../hooks/useWardrobe";
import { uploadApi } from "../../../api/upload.api";
import {
  ITEM_CATEGORIES,
  CATEGORY_LABELS,
  COMMON_COLORS,
  type ItemCategory,
} from "@/shared";
import styles from "./AddItemPage.module.css";

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
  const { data: wardrobes, isLoading: loadingWardrobes } = useWardrobes();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<
    "original" | "processed"
  >("original");
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const [wardrobeId, setWardrobeId] = useState<string>("");
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      setOriginalFile(file);
      setOriginalPreview(URL.createObjectURL(file));
      setProcessedFile(null);
      setProcessedPreview(null);
      setSelectedVersion("original");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          processFile(file);
          e.preventDefault();
        }
        break;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  // Add paste event listener
  useEffect(() => {
    const handleWindowPaste = (e: Event) => handlePaste(e as ClipboardEvent);
    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, []);

  const handleRemoveBackground = async () => {
    if (!originalFile) return;

    try {
      setIsRemovingBg(true);
      setError(null);

      const result = await uploadApi.removeBackground(originalFile);
      setProcessedFile(result);
      setProcessedPreview(URL.createObjectURL(result));
      setSelectedVersion("processed");
    } catch (err) {
      setError("Không thể xóa nền ảnh. Vui lòng thử lại.");
      console.error("Background removal error:", err);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!originalFile) {
      setError("Vui lòng chọn ảnh");
      return;
    }
    if (!wardrobeId) {
      setError("Vui lòng chọn tủ đồ");
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

      // Upload the selected version (original or processed)
      const fileToUpload =
        selectedVersion === "processed" && processedFile
          ? processedFile
          : originalFile;
      const imageUrl = await uploadApi.uploadImage(fileToUpload);

      // Create wardrobe item
      await createMutation.mutateAsync({
        wardrobeId,
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
        <div
          className={styles.imageSection}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {originalPreview ? (
            <img
              src={
                selectedVersion === "processed" && processedPreview
                  ? processedPreview
                  : originalPreview
              }
              alt="Preview"
              className={styles.imagePreview}
            />
          ) : (
            <div
              className={styles.imagePlaceholder}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className={styles.placeholderText}>
                Chọn ảnh, kéo thả hoặc dán (Ctrl+V)
              </span>
            </div>
          )}

          {originalPreview && (
            <div className={styles.imageActions}>
              <button
                type="button"
                className={styles.imageActionBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn ảnh khác
              </button>
              <button
                type="button"
                className={`${styles.imageActionBtn} ${styles.removeBgBtn} ${
                  processedFile ? styles.done : ""
                }`}
                onClick={handleRemoveBackground}
                disabled={isRemovingBg || !!processedFile}
              >
                {isRemovingBg
                  ? "Đang xử lý..."
                  : processedFile
                    ? "✓ Đã xóa nền"
                    : "Xóa nền"}
              </button>
            </div>
          )}

          {processedFile && (
            <div className={styles.versionSelector}>
              <button
                type="button"
                className={`${styles.versionBtn} ${
                  selectedVersion === "original" ? styles.active : ""
                }`}
                onClick={() => setSelectedVersion("original")}
              >
                Ảnh gốc
              </button>
              <button
                type="button"
                className={`${styles.versionBtn} ${
                  selectedVersion === "processed" ? styles.active : ""
                }`}
                onClick={() => setSelectedVersion("processed")}
              >
                Đã xóa nền
              </button>
            </div>
          )}
        </div>

        <div className={styles.form}>
          {/* Wardrobe Selection */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tủ đồ <span className={styles.required}>*</span>
            </label>
            {loadingWardrobes ? (
              <div className={styles.loading}>Đang tải...</div>
            ) : wardrobes && wardrobes.length > 0 ? (
              <select
                className={styles.select}
                value={wardrobeId}
                onChange={(e) => setWardrobeId(e.target.value)}
                required
              >
                <option value="">Chọn tủ đồ</option>
                {wardrobes.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (
                    {w.visibility === "public" ? "Công khai" : "Riêng tư"})
                  </option>
                ))}
              </select>
            ) : (
              <div className={styles.noWardrobes}>
                Bạn chưa có tủ đồ nào. <a href="/wardrobes">Tạo tủ đồ mới</a>
              </div>
            )}
          </div>

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
