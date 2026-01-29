import { useState, useEffect } from "react";
import { debugApi } from "../../../api/debug.api";
import { Loader2, Check, AlertCircle, Sparkles } from "lucide-react";

interface WardrobeItem {
  id: string;
  image_url: string;
  category: string;
  color: string;
  name: string;
  brand?: string;
  material?: string;
  purchase_price?: number;
  embedding?: string; // pgvector returns string or array depending on driver, but usually string in JSON response if not parsed
}

interface ProcessedItem extends WardrobeItem {
  parsedEmbedding: number[] | null;
  compatibility?: number;
}

export function FashionDebugPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // App state
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load items on auth
  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await debugApi.getWardrobeItems();
      
      // Parse embeddings
      const processed: ProcessedItem[] = data.map((item: any) => {
        let parsedEmbedding: number[] | null = null;
        if (item.embedding) {
          try {
             // Handle if it's a string representation of vector
            if (typeof item.embedding === 'string') {
                parsedEmbedding = JSON.parse(item.embedding.replace('[', '[').replace(']', ']'));
            } else if (Array.isArray(item.embedding)) {
                parsedEmbedding = item.embedding;
            }
          } catch (e) {
            console.error("Failed to parse embedding for item", item.id);
          }
        }
        return { ...item, parsedEmbedding };
      });
      
      setItems(processed);
    } catch (err) {
      console.error("Failed to load items:", err);
      alert("Failed to load wardrobe items");
    } finally {
      setIsLoading(false);
    }
  };



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "mytudo-debug") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
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
    // Transform [-1, 1] to [0, 100]
    return Math.round((similarity + 1) * 50);
  };

  useEffect(() => {
    if (isAuthenticated && items.length === 0 && !isLoading) {
        loadItems();
    }
  }, [isAuthenticated]);

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

  const selectedItem = items.find(i => i.id === selectedItemId);

  // Compute compatibility for all other items if one is selected
  const displayItems = items.map(item => {
      let compatibility: number | undefined = undefined;
      
      if (selectedItem && selectedItem.parsedEmbedding && item.parsedEmbedding && item.id !== selectedItem.id) {
          compatibility = calculateCompatibility(selectedItem.parsedEmbedding, item.parsedEmbedding);
      }
      return { ...item, compatibility };
  }).sort((a, b) => {
      // Sort so highest compatibility is first, undefined last
      const compA = a.compatibility !== undefined ? a.compatibility : -1;
      const compB = b.compatibility !== undefined ? b.compatibility : -1;
      return compB - compA;
  });

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
              Select an item to view compatibility scores with other items in the database.
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="font-medium text-gray-900">{items.length} Items Loaded</div>
            <div>{items.filter(i => i.parsedEmbedding).length} Embeddings Available</div>
          </div>
        </header>

        {isLoading ? (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {displayItems.map((item) => {
                    const isActive = selectedItemId === item.id;
                    const hasEmbedding = !!item.parsedEmbedding;

                    return (
                        <div
                            key={item.id}
                            onClick={() => {
                                if (hasEmbedding) setSelectedItemId(item.id);
                            }}
                            className={`
                                group relative aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300
                                ${isActive 
                                    ? "ring-4 ring-teal-500 shadow-xl scale-[1.02] z-10" 
                                    : hasEmbedding ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : "opacity-60 cursor-not-allowed grayscale"}
                            `}
                        >
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover bg-white"
                            />
                            
                            {/* Overlay info */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                <p className="text-xs opacity-80">{item.category} • {item.color}</p>
                            </div>

                            {/* Status Indicator */}
                            <div className="absolute top-2 left-2">
                                {hasEmbedding ? (
                                    <div className="bg-green-100 p-1.5 rounded-full shadow-sm text-green-600" title="Embedding ready">
                                        <Check className="h-3 w-3" />
                                    </div>
                                ) : (
                                    <div className="bg-red-100 p-1.5 rounded-full shadow-sm text-red-600" title="No embedding">
                                        <AlertCircle className="h-3 w-3" />
                                    </div>
                                )}
                            </div>

                            {/* Compatibility Score Overlay */}
                            {item.compatibility !== undefined && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className={`
                                        text-center transform transition-transform scale-110
                                        ${item.compatibility > 75 ? "text-green-400" : item.compatibility > 50 ? "text-yellow-400" : "text-red-400"}
                                    `}>
                                        <div className="text-3xl font-bold">{item.compatibility}%</div>
                                        <div className="text-xs font-medium text-white uppercase tracking-wider mt-1">Match</div>
                                    </div>
                                </div>
                            )}

                             {/* Selection Label */}
                             {isActive && (
                                <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                    SOURCE
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
