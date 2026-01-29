import { useState, useRef } from "react";
import { debugApi } from "../../../api/debug.api";
import { Loader2, Upload, Check, AlertCircle, Sparkles, X } from "lucide-react";

interface ExtractedAttribute {
  category: string;
  color: string;
  name: string;
  brand?: string;
  material?: string;
  size?: string;
  estimated_price?: number;
}

interface DebugImage {
  id: string;
  file: File;
  previewUrl: string;
  embedding: number[] | null;
  loading: boolean;
  error: string | null;
  attributes?: ExtractedAttribute[];
  nobgUrl?: string;
  analyzing?: boolean;
  saved?: boolean;
}

export function FashionDebugPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // App state
  const [images, setImages] = useState<DebugImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "mytudo-debug") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const newImages: DebugImage[] = Array.from(files).map((file) => ({
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      embedding: null,
      loading: true,
      error: null,
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Process embeddings for each image
    for (const image of newImages) {
      try {
        const response = await debugApi.generateEmbedding(image.file);
        
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, embedding: response.embedding, loading: false }
              : img
          )
        );

        // Auto-save embedding
        try {
            await debugApi.saveDebugEmbedding(image.file, response.embedding);
            setImages((prev) =>
              prev.map((img) =>
                img.id === image.id ? { ...img, saved: true } : img
              )
            );
        } catch (saveErr) {
            console.error("Failed to save debug embedding:", saveErr);
        }
      } catch (err) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, error: "Failed to generate embedding", loading: false }
              : img
          )
        );
      }
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImageId === id) setSelectedImageId(null);
  };

  const handleAnalyze = async (image: DebugImage, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setImages(prev => prev.map(img => 
      img.id === image.id ? { ...img, analyzing: true } : img
    ));

    try {
        // Run background removal and attribute extraction in parallel
        const [nobgBlob, attributesData] = await Promise.all([
            debugApi.removeBackground(image.file),
            debugApi.extractAttributes(image.file)
        ]);

        const nobgUrl = URL.createObjectURL(nobgBlob);

        setImages(prev => prev.map(img => 
            img.id === image.id 
                ? { 
                    ...img, 
                    analyzing: false, 
                    nobgUrl, 
                    attributes: attributesData.items 
                  } 
                : img
        ));
        
        // Auto-select and show analysis
        setSelectedImageId(image.id);
        setShowAnalysis(true);

    } catch (err) {
        console.error(err);
        setImages(prev => prev.map(img => 
            img.id === image.id ? { ...img, analyzing: false, error: "Analysis failed" } : img
        ));
    }
  };

  const calculateCompatibility = (embedding1: number[], embedding2: number[]) => {
    // Dot product
    let dot = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
        dot += embedding1[i] * embedding2[i];
        norm1 += embedding1[i] * embedding1[i];
        norm2 += embedding2[i] * embedding2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    const similarity = dot / (norm1 * norm2);
    // Transform [-1, 1] to [0, 100]
    return ((similarity + 1) * 50).toFixed(1);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Developer Access</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter password to access debug tools
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
            >
              Access Debug Tools
            </button>
          </form>
        </div>
      </div>
    );
  }

  const selectedImage = images.find((i) => i.id === selectedImageId);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-teal-500" />
              Fashion Compatibility Debugger
            </h1>
            <p className="text-gray-500 mt-1">
              Upload images to generate embeddings and test compatibility scoring
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="font-medium text-gray-900">{images.length} Images</div>
            <div>{images.filter(i => i.embedding).length} Embeddings Ready</div>
          </div>
        </header>

        {/* Upload Area */}
        <div
          className={`
            relative group border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${isDragging 
              ? "border-teal-500 bg-teal-50" 
              : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
            }
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            accept="image/*"
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`
              p-4 rounded-full transition-colors
              ${isDragging ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-500"}
            `}>
              <Upload className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900">
                Click or drag images here
              </p>
              <p className="text-sm text-gray-500">
                Upload clothing items to analyze compatibility
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Detail View */}
        {selectedImage && showAnalysis && (selectedImage.attributes || selectedImage.nobgUrl) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">AI Analysis Results</h2>
                    <button 
                        onClick={() => setShowAnalysis(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="grid md:grid-cols-2 gap-8 p-6">
                    {/* Visuals */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Original</label>
                                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    <img src={selectedImage.previewUrl} className="w-full h-full object-contain" alt="Original" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Background Removed</label>
                                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[url('https://border-run.com/images/transparent-background.png')] bg-repeat border border-gray-200">
                                    {selectedImage.nobgUrl ? (
                                        <img src={selectedImage.nobgUrl} className="w-full h-full object-contain" alt="No BG" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Not generated</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attributes */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Extracted Attributes</h3>
                            {selectedImage.attributes && selectedImage.attributes.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedImage.attributes.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-teal-700">{item.name}</span>
                                                <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                                                    {(item.estimated_price || 0).toLocaleString()} VND
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">Category</span>
                                                    <span className="font-medium text-gray-900">{item.category}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">Color</span>
                                                    <span className="font-medium text-gray-900 capitalize">{item.color}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">Brand</span>
                                                    <span className="font-medium text-gray-900">{item.brand || '-'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">Material</span>
                                                    <span className="font-medium text-gray-900">{item.material || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 italic">No attributes detected or extraction not run.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Results Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {images.map((img) => {
              const isActive = selectedImageId === img.id;
              let compatibility = null;
              
              if (selectedImage && selectedImage.embedding && img.embedding && img.id !== selectedImage.id) {
                compatibility = calculateCompatibility(selectedImage.embedding, img.embedding);
              }

              return (
                <div
                  key={img.id}
                  onClick={() => {
                      setSelectedImageId(img.id);
                      if (img.attributes || img.nobgUrl) setShowAnalysis(true);
                  }}
                  className={`
                    group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                    ${isActive 
                      ? "ring-4 ring-teal-500 shadow-xl scale-[1.02]" 
                      : "hover:shadow-lg hover:-translate-y-1"
                    }
                  `}
                >
                  <img
                    src={img.previewUrl}
                    alt="Uploaded item"
                    className="w-full h-full object-cover bg-white"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => handleDelete(img.id, e)}
                        className="p-1.5 bg-white/90 text-gray-700 rounded-full hover:bg-red-50 hover:text-red-600 font-medium shadow-sm"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      
                      {!img.attributes && !img.analyzing && (
                          <button
                            onClick={(e) => handleAnalyze(img, e)}
                            className="p-1.5 bg-white/90 text-gray-700 rounded-full hover:bg-teal-50 hover:text-teal-600 font-medium shadow-sm"
                            title="Run AI Analysis"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>
                      )}
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-2 left-2">
                    {img.analyzing ? (
                        <div className="bg-white/90 p-1.5 rounded-full shadow-sm animate-spin" title="Analyzing...">
                            <Loader2 className="h-4 w-4 text-purple-600" />
                        </div>
                    ) : img.attributes ? (
                        <div className="bg-purple-100 p-1.5 rounded-full shadow-sm text-purple-600" title="Analysis Complete">
                            <Sparkles className="h-4 w-4" />
                        </div>
                    ) : img.loading ? (
                      <div className="bg-white/90 p-1.5 rounded-full shadow-sm animate-spin">
                        <Loader2 className="h-4 w-4 text-teal-600" />
                      </div>
                    ) : img.error ? (
                      <div className="bg-red-100 p-1.5 rounded-full shadow-sm text-red-600" title={img.error}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="bg-green-100 p-1.5 rounded-full shadow-sm text-green-600" title="Embedding ready">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    
                    {img.saved && (
                        <div className="absolute top-2 left-8 bg-blue-100 p-1.5 rounded-full shadow-sm text-blue-600" title="Saved to DB">
                            <Check className="h-4 w-4" />
                        </div>
                    )}
                  </div>

                  {/* Compatibility Score Overlay */}
                  {compatibility && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                      <div className={`
                        text-center transform transition-transform scale-110
                        ${Number(compatibility) > 75 ? "text-green-400" : Number(compatibility) > 50 ? "text-yellow-400" : "text-red-400"}
                      `}>
                        <div className="text-3xl font-bold">{compatibility}%</div>
                        <div className="text-xs font-medium text-white uppercase tracking-wider mt-1">Match</div>
                      </div>
                    </div>
                  )}

                  {/* Selection Label */}
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 bg-teal-500 text-white text-xs font-bold py-1.5 text-center uppercase tracking-widest">
                      {img.attributes ? "Selected & Analyzed" : "Selected Source"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
