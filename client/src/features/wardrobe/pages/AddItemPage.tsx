import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { useCreateWardrobeItem, useWardrobes } from "../hooks/useWardrobe";
import {
  uploadApi,
  type ExtractedItem,
  type ExtractionResponse,
} from "../../../api/upload.api";
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

interface PendingItem extends ExtractedItem {
  id: string;
  imageFile: File;
  imagePreview: string;
  selected: boolean;
}

export function AddItemPage() {
  const navigate = useNavigate();
  const createMutation = useCreateWardrobeItem();
  const { data: wardrobes, isLoading: loadingWardrobes } = useWardrobes();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-image mode state
  const [mode, setMode] = useState<"single" | "multi">("single");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Single-image mode state (original)
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


  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);

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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (mode === "multi" || files.length > 1) {
      setMode("multi");
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      setSelectedFiles((prev) => [...prev, ...imageFiles]);
    } else {
      processFile(files[0]);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          if (mode === "multi") {
            setSelectedFiles((prev) => [...prev, file]);
          } else {
            processFile(file);
          }
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

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );

    if (mode === "multi" || files.length > 1) {
      setMode("multi");
      setSelectedFiles((prev) => [...prev, ...files]);
    } else if (files.length === 1) {
      processFile(files[0]);
    }
  };

  // Add paste event listener
  useEffect(() => {
    const handleWindowPaste = (e: Event) => handlePaste(e as ClipboardEvent);
    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, [mode]);

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

  const handleSingleExtract = async () => {
    if (!originalFile) return;
    try {
      setIsExtracting(true);
      setError(null);

      const response = await uploadApi.extractAttributes(originalFile);
      console.log("Extracted attributes:", response);

      if (response.items && response.items.length > 0) {
        const item = response.items[0];

        // Map category
        const normalizedCategory = item.category.toLowerCase();
        const itemCategory = ITEM_CATEGORIES.includes(
          normalizedCategory as ItemCategory
        )
          ? (normalizedCategory as ItemCategory)
          : "accessories";
        setCategory(itemCategory);

        // Map color
        const normalizedColor = item.color.toLowerCase();
        const itemColor = COMMON_COLORS.includes(normalizedColor)
          ? normalizedColor
          : "gray";
        setColor(itemColor);

        if (item.name) setName(item.name);
        if (item.brand) setBrand(item.brand);
        if (item.material) setMaterial(item.material);
        if (item.size) setSize(item.size);
        if (item.estimated_price)
          setPurchasePrice(item.estimated_price.toString());
      }
    } catch (err: any) {
      setError(err.message || "AI Analysis failed");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateEmbedding = async () => {
    const fileToProcess =
      selectedVersion === "processed" && processedFile
        ? processedFile
        : originalFile;

    if (!fileToProcess) return;

    try {
      setIsGeneratingEmbedding(true);
      setError(null);
      console.log("Generating embedding...");

      const response = await uploadApi.generateEmbedding(fileToProcess);
      console.log("Embedding result:", response);

      if (response && response.embedding) {
        setEmbedding(response.embedding);
      }
    } catch (err: any) {
      console.error("Embedding generation error:", err);
      setError(err.message || "Failed to generate embedding");
    } finally {
      setIsGeneratingEmbedding(false);
    }
  };

  const handleExtractWithAI = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsExtracting(true);
      setError(null);

      const response = await uploadApi.extractAttributesBatch(selectedFiles);
      console.log("Batch extraction result:", response);

      // Convert extraction results to pending items
      const items: PendingItem[] = [];
      response.results.forEach((result: ExtractionResponse) => {
        const file = selectedFiles[result.image_index];
        result.items.forEach((item, itemIdx) => {
          items.push({
            ...item,
            category: item.category.toLowerCase(),
            color: item.color.toLowerCase(),
            id: `${result.image_index}-${itemIdx}-${Date.now()}`,
            imageFile: file,
            imagePreview: URL.createObjectURL(file),
            selected: true,
          });
        });
      });

      setPendingItems(items);
    } catch (err: any) {
      setError(err.message || "Không thể phân tích ảnh. Vui lòng thử lại.");
      console.error("AI extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    setPendingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updatePendingItem = (id: string, updates: Partial<PendingItem>) => {
    setPendingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleSubmitMultiple = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!wardrobeId) {
      setError("Vui lòng chọn tủ đồ");
      return;
    }

    const selectedItems = pendingItems.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một món đồ");
      return;
    }

    try {
      setIsUploading(true);

      for (const item of selectedItems) {
        // Validate category (case-insensitive)
        const normalizedCategory = item.category.toLowerCase();
        const itemCategory = ITEM_CATEGORIES.includes(normalizedCategory as ItemCategory)
          ? (normalizedCategory as ItemCategory)
          : "accessories";

        // Validate color (case-insensitive)
        const normalizedColor = item.color.toLowerCase();
        const itemColor = COMMON_COLORS.includes(normalizedColor)
          ? normalizedColor
          : "gray";

        // Upload image
        const imageUrl = await uploadApi.uploadImage(item.imageFile);

        // Create wardrobe item
        await createMutation.mutateAsync({
          wardrobeId,
          imageUrl,
          category: itemCategory,
          color: itemColor,
          name: item.name || undefined,
          brand: item.brand || undefined,
          size: item.size || undefined,
          material: item.material || undefined,
          purchasePrice: item.estimated_price || undefined,
        });
      }

      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Không thể thêm sản phẩm"
      );
    } finally {
      setIsUploading(false);
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
        embedding: embedding || undefined,
      });

      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Không thể thêm sản phẩm"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetToSingleMode = () => {
    setMode("single");
    setSelectedFiles([]);
    setPendingItems([]);
  };

  // Multi-image mode with pending items
  if (pendingItems.length > 0) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button
            className={styles.backBtn}
            onClick={() => setPendingItems([])}
          >
            ←
          </button>
          <h1 className={styles.title}>Xác nhận món đồ</h1>
        </div>

        <form onSubmit={handleSubmitMultiple}>
          {/* Wardrobe Selection */}
          <div className={styles.form}>
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
          </div>

          {/* Pending Items List */}
          <div className={styles.pendingItemsList}>
            <p className={styles.pendingItemsInfo}>
              Đã phát hiện {pendingItems.length} món đồ. Chọn những món bạn muốn
              thêm:
            </p>
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.pendingItem} ${
                  item.selected ? styles.selected : ""
                }`}
              >
                <div className={styles.pendingItemCheck}>
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItemSelection(item.id)}
                  />
                </div>
                <img
                  src={item.imagePreview}
                  alt={item.name}
                  className={styles.pendingItemImage}
                />
                <div className={styles.pendingItemDetails}>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      updatePendingItem(item.id, { name: e.target.value })
                    }
                    className={styles.pendingItemName}
                    placeholder="Tên sản phẩm"
                  />
                  <div className={styles.pendingItemMeta}>
                    <span
                      className={styles.pendingItemColor}
                      style={{ backgroundColor: COLOR_MAP[item.color] || item.color }}
                    />
                    <span>{CATEGORY_LABELS[item.category as ItemCategory] || item.category}</span>
                    {item.brand && <span>• {item.brand}</span>}
                    {item.estimated_price && (
                      <span>• ~{item.estimated_price.toLocaleString()}đ</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <Button
              type="submit"
              isLoading={isUploading || createMutation.isPending}
            >
              Thêm {pendingItems.filter((i) => i.selected).length} món vào tủ đồ
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPendingItems([])}
            >
              Quay lại
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Multi-image selection mode
  if (mode === "multi") {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={resetToSingleMode}>
            ←
          </button>
          <h1 className={styles.title}>Thêm nhiều món đồ</h1>
        </div>

        <div
          className={styles.imageSection}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {selectedFiles.length > 0 ? (
            <div className={styles.multiImageGrid}>
              {selectedFiles.map((file, idx) => (
                <div key={idx} className={styles.multiImageItem}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selected ${idx + 1}`}
                    className={styles.multiImagePreview}
                  />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => removeFile(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div
                className={styles.addMoreImage}
                onClick={() => fileInputRef.current?.click()}
              >
                <span>+</span>
              </div>
            </div>
          ) : (
            <div
              className={styles.imagePlaceholder}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className={styles.placeholderText}>
                Chọn nhiều ảnh, kéo thả hoặc dán (Ctrl+V)
              </span>
            </div>
          )}
        </div>

        {selectedFiles.length > 0 && (
          <div className={styles.form}>
            <div className={styles.aiExtractionInfo}>
              <p>
                🤖 AI sẽ phân tích {selectedFiles.length} ảnh và tự động nhận
                diện các món đồ trong mỗi ảnh.
              </p>
            </div>

            <div className={styles.actions}>
              <Button
                type="button"
                onClick={handleExtractWithAI}
                isLoading={isExtracting}
              >
                {isExtracting
                  ? "Đang phân tích..."
                  : `Phân tích ${selectedFiles.length} ảnh với AI`}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={resetToSingleMode}
              >
                Hủy
              </Button>
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </div>
        )}
      </div>
    );
  }

  // Single image mode (original UI)
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className={styles.title}>Thêm món đồ</h1>
      </div>

      {/* Mode Switch */}
      <div className={styles.modeSwitch}>
        <button
          type="button"
          className={`${styles.modeSwitchBtn} ${styles.active}`}
          onClick={() => setMode("single")}
        >
          Một ảnh
        </button>
        <button
          type="button"
          className={styles.modeSwitchBtn}
          onClick={() => setMode("multi")}
        >
          Nhiều ảnh (AI)
        </button>
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
              <button
                type="button"
                className={`${styles.imageActionBtn} ${styles.aiBtn}`}
                onClick={handleSingleExtract}
                disabled={isExtracting}
              >
                {isExtracting ? "Đang phân tích..." : "✨ AI Phân tích"}
              </button>
              <button
                type="button"
                className={`${styles.imageActionBtn} ${styles.aiBtn}`}
                onClick={handleGenerateEmbedding}
                disabled={isGeneratingEmbedding}
              >
                {isGeneratingEmbedding
                  ? "Đang tạo..."
                  : embedding
                    ? "✓ Embedding"
                    : "⚡ Vector"}
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
