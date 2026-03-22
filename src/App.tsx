import { HashRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, ShoppingBag, Settings, Search, Filter, Plus, Trash2, ExternalLink, Github, LogOut, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Product, GitHubConfig } from "./types";
import { GitHubService } from "./lib/github";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card rounded-2xl px-6 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Affiliate<span className="text-blue-500">Hub</span></span>
        </Link>

        <div className="flex items-center gap-4">
          <Link 
            to={isAdmin ? "/" : "/admin"} 
            className="glass-button px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
          >
            {isAdmin ? (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Lihat Toko</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="w-4 h-4" />
                <span>Manajemen</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

// --- Pages ---

const DUMMY_PRODUCTS: Product[] = [
  { id: "1", name: "Smartphone Ultra Pro Max", number: "001", link: "#", image: "https://picsum.photos/seed/phone/400/400", category: "Elektronik" },
  { id: "2", name: "Sneakers Sporty X", number: "002", link: "#", image: "https://picsum.photos/seed/shoes/400/400", category: "Fashion" },
  { id: "3", name: "Skincare Glow Serum", number: "003", link: "#", image: "https://picsum.photos/seed/serum/400/400", category: "Kecantikan" },
];

const PublicView = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const owner = localStorage.getItem("gh_owner");
        const repo = localStorage.getItem("gh_repo");
        const branch = localStorage.getItem("gh_branch") || "main";
        
        if (owner && repo) {
          const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/products.json`);
          if (res.ok) {
            const data = await res.json();
            setProducts(data);
          } else {
            setProducts(DUMMY_PRODUCTS);
          }
        } else {
          setProducts(DUMMY_PRODUCTS);
        }
      } catch (e) {
        setProducts(DUMMY_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.number.includes(search);
    const matchesCategory = category === "Semua" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Semua", ...new Set(products.map(p => p.category))];

  return (
    <div className="pt-28 pb-12 px-4 max-w-7xl mx-auto">
      <header className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-display font-bold mb-4"
        >
          Temukan Produk <span className="text-blue-500">Favoritmu</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-neutral-400 max-w-2xl mx-auto"
        >
          Koleksi produk pilihan terbaik dengan harga spesial. Cari berdasarkan nama atau nomor produk.
        </motion.p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari nama atau nomor produk..."
            className="w-full glass-card bg-white/5 border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-6 py-4 rounded-2xl font-medium whitespace-nowrap transition-all",
                category === cat ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass-card hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-3xl overflow-hidden group three-d-hover"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={product.image || "https://picsum.photos/seed/product/400/400"} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    #{product.number}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">{product.category}</div>
                  <h3 className="font-display font-bold text-lg mb-4 line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
                  <a 
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full glass-button bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
                  >
                    <span>Beli Sekarang</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <Search className="w-10 h-10 text-neutral-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Produk Tidak Ditemukan</h3>
          <p className="text-neutral-500">Coba kata kunci lain atau periksa kategori berbeda.</p>
        </div>
      )}
    </div>
  );
};

const AdminPanel = () => {
  const [config, setConfig] = useState<GitHubConfig | null>(() => {
    const saved = localStorage.getItem("gh_config");
    return saved ? JSON.parse(saved) : null;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: "Elektronik",
    image: ""
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (config) {
      loadProducts();
      localStorage.setItem("gh_owner", config.owner);
      localStorage.setItem("gh_repo", config.repo);
      localStorage.setItem("gh_branch", config.branch);
    }
  }, [config]);

  const loadProducts = async () => {
    if (!config) return;
    setLoading(true);
    try {
      const service = new GitHubService(config);
      const data = await service.getProducts();
      setProducts(data);
    } catch (e) {
      alert("Gagal memuat data. Periksa token dan konfigurasi repository.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newConfig: GitHubConfig = {
      token: formData.get("token") as string,
      owner: formData.get("owner") as string,
      repo: formData.get("repo") as string,
      branch: formData.get("branch") as string,
    };
    setConfig(newConfig);
    localStorage.setItem("gh_config", JSON.stringify(newConfig));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !newProduct.name || !newProduct.link) return;

    setLoading(true);
    try {
      const service = new GitHubService(config);
      const updatedProducts = [
        ...products,
        {
          ...newProduct,
          id: Date.now().toString(),
          number: (products.length + 1).toString().padStart(3, "0"),
        } as Product
      ];
      await service.saveProducts(updatedProducts);
      setProducts(updatedProducts);
      setIsAdding(false);
      setNewProduct({ category: "Elektronik", image: "" });
    } catch (e) {
      alert("Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!config || !confirm("Hapus produk ini?")) return;
    setLoading(true);
    try {
      const service = new GitHubService(config);
      const updatedProducts = products.filter(p => p.id !== id);
      await service.saveProducts(updatedProducts);
      setProducts(updatedProducts);
    } catch (e) {
      alert("Gagal menghapus produk.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    setUploading(true);
    try {
      const service = new GitHubService(config);
      const url = await service.uploadImage(file);
      setNewProduct(prev => ({ ...prev, image: url }));
    } catch (e) {
      alert("Gagal mengupload gambar.");
    } finally {
      setUploading(false);
    }
  };

  if (!config) {
    return (
      <div className="pt-32 pb-12 px-4 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Konfigurasi GitHub</h2>
              <p className="text-sm text-neutral-400">Hubungkan repository untuk menyimpan data.</p>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">GitHub Personal Access Token</label>
              <input name="token" type="password" required className="w-full glass-card bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="ghp_..." />
              <p className="text-[10px] text-neutral-500 mt-1">Buat di: GitHub Settings {">"} Developer Settings {">"} Personal Access Tokens {">"} Tokens (classic)</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Username/Owner</label>
                <input name="owner" required className="w-full glass-card bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Repository Name</label>
                <input name="repo" required className="w-full glass-card bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="my-affiliate-site" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Branch</label>
              <input name="branch" defaultValue="main" required className="w-full glass-card bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20">
              Hubungkan Sekarang
            </button>
          </form>
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Cara Setup:</h4>
            <ol className="text-[10px] text-neutral-400 space-y-1 list-decimal list-inside">
              <li>Buat repository baru di GitHub.</li>
              <li>Buat Token (classic) dengan izin 'repo'.</li>
              <li>Isi form di atas dan klik Hubungkan.</li>
              <li>Tambahkan produk pertama Anda.</li>
              <li>Aktifkan GitHub Pages di Settings repository Anda.</li>
            </ol>
          </div>
          <p className="text-[10px] text-neutral-500 mt-4 text-center">
            Token disimpan secara lokal di browser Anda. Pastikan token memiliki izin 'repo'.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Manajemen Produk</h1>
          <p className="text-neutral-400">Kelola daftar link affiliasi Anda.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Produk</span>
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem("gh_config");
              setConfig(null);
            }}
            className="glass-button px-4 py-3 rounded-xl text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && !isAdding && (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && products.length === 0 && !isAdding && (
        <div className="text-center py-20 glass-card rounded-3xl">
          <ShoppingBag className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold">Belum Ada Produk</h3>
          <p className="text-neutral-500 mb-6">Mulai tambahkan produk pertama Anda.</p>
          <button onClick={() => setIsAdding(true)} className="text-blue-500 font-bold hover:underline">Tambah Sekarang</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="glass-card rounded-2xl p-4 flex gap-4 items-center">
            <img src={product.image} className="w-20 h-20 rounded-xl object-cover bg-neutral-800" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-neutral-500 font-bold">#{product.number}</div>
              <h3 className="font-bold truncate">{product.name}</h3>
              <div className="text-xs text-blue-400">{product.category}</div>
            </div>
            <button 
              onClick={() => handleDeleteProduct(product.id)}
              className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">Tambah Produk Baru</h2>
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Nama Produk</label>
                      <input 
                        required
                        className="w-full glass-card bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                        value={newProduct.name || ""}
                        onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Kategori</label>
                      <select 
                        className="w-full glass-card bg-neutral-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={newProduct.category}
                        onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option>Elektronik</option>
                        <option>Fashion</option>
                        <option>Kecantikan</option>
                        <option>Rumah Tangga</option>
                        <option>Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Link Affiliasi</label>
                      <input 
                        required
                        className="w-full glass-card bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                        placeholder="https://shope.ee/..."
                        value={newProduct.link || ""}
                        onChange={e => setNewProduct(prev => ({ ...prev, link: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Foto Produk</label>
                    <div className="aspect-square glass-card rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                      {newProduct.image ? (
                        <>
                          <img src={newProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-bold">Ganti Foto</label>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          {uploading ? (
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            <>
                              <Plus className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                              <p className="text-xs text-neutral-500">Klik untuk upload foto</p>
                            </>
                          )}
                        </div>
                      )}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={uploading} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 glass-button py-4 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || uploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? "Menyimpan..." : "Simpan Produk"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<PublicView />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        
        <footer className="py-12 border-t border-white/5 text-center text-neutral-500 text-sm">
          <p>&copy; 2026 AffiliateHub 3D. Dibuat dengan &hearts; untuk kesuksesan Anda.</p>
        </footer>
      </div>
    </Router>
  );
}
