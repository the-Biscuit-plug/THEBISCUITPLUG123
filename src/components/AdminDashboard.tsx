import React, { useState, useEffect, useRef } from 'react';
import { Product, Order, BakerStats, OrderStatus } from '../types';
import { formatZAR, formatShortDate } from '../utils/format';
import {
  ShieldCheck,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  X,
  Check,
  Lock,
  Cookie,
  UploadCloud,
  Image as ImageIcon,
  ImagePlus,
  CheckCircle2,
  Eye,
  Sparkles,
  Camera,
  Link as LinkIcon,
  FileImage,
  ArrowUpRight
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshProducts: () => void;
}

const BAKERY_IMAGE_PRESETS = [
  {
    name: 'NYC Thicc Choc Chip',
    url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    tag: 'Classic',
    desc: 'Golden crust with molten Belgian dark chocolate chunks'
  },
  {
    name: 'Lotus Biscoff Lava',
    url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    tag: 'Stuffed',
    desc: 'Spiced speculoos dough with caramelized molten center'
  },
  {
    name: 'The Mzansi Milk Tart',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    tag: 'Heritage',
    desc: 'Shortcrust cookie pastry filled with cinnamon velvet custard'
  },
  {
    name: 'Campfire S\'mores Slab',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    tag: 'Brownie',
    desc: 'Valrhona cocoa brownie topped with blow-torched fluff'
  },
  {
    name: 'Red Velvet Cheesecake Core',
    url: 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?auto=format&fit=crop&w=800&q=80',
    tag: 'Cheesecake',
    desc: 'Crimson cocoa biscuit stuffed with cream cheese heart'
  },
  {
    name: 'Sassy Pink Stamped Hearts',
    url: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
    tag: 'Stamped',
    desc: 'Pastel pink glaze shortbread stamped with cheeky text'
  },
  {
    name: 'Triple Dark Valrhona',
    url: 'https://images.unsplash.com/photo-1618923834413-2770b904ee10?auto=format&fit=crop&w=800&q=80',
    tag: 'Decadent',
    desc: '70% dark chocolate dough with flaked Maldon sea salt'
  },
  {
    name: 'Salted Caramel Pretzel',
    url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    tag: 'Sweet & Salty',
    desc: 'Crunchy crushed pretzels and molten golden dulce de leche'
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshProducts,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default open for ease of evaluation
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'inventory' | 'new-product'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<BakerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // New product form state
  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('48');
  const [newCategory, setNewCategory] = useState<Product['category']>('stuffed-cookies');
  const [newBadge, setNewBadge] = useState('New Drop ✨');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80');
  const [newStock, setNewStock] = useState('25');

  // Image attachment controls for new product
  const [imageAttachMode, setImageAttachMode] = useState<'upload' | 'presets' | 'url'>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing product image editing state
  const [editingProductImage, setEditingProductImage] = useState<Product | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const [editImageFileName, setEditImageFileName] = useState<string>('');
  const [editImageMode, setEditImageMode] = useState<'upload' | 'presets' | 'url'>('upload');
  const [editIsDragging, setEditIsDragging] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/stats'),
      ]);
      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();
      setOrders(ordersData.orders || []);
      setStats(statsData.stats || null);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatusMessage(`Order ${orderId} updated to ${newStatus.toUpperCase()}! 🎀`);
        setTimeout(() => setStatusMessage(''), 3000);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inStock: !product.inStock,
          stockCount: !product.inStock ? 20 : 0,
        }),
      });
      onRefreshProducts();
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this treat from the bakery menu?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      onRefreshProducts();
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to process uploaded image file and produce a data URL
  const processImageFile = (
    file: File,
    onSuccess: (dataUrl: string, name: string, sizeStr: string) => void
  ) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    const sizeKB = (file.size / 1024).toFixed(0);
    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${sizeKB} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onSuccess(result, file.name, sizeStr);
      }
    };
    reader.readAsDataURL(file);
  };

  // File upload handlers for New Biscuit Form
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl, name, size) => {
        setNewImage(dataUrl);
        setUploadedFileName(name);
        setUploadedFileSize(size);
        setStatusMessage(`Image "${name}" attached successfully! 📸`);
        setTimeout(() => setStatusMessage(''), 3000);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl, name, size) => {
        setNewImage(dataUrl);
        setUploadedFileName(name);
        setUploadedFileSize(size);
        setStatusMessage(`Image "${name}" attached successfully! 📸`);
        setTimeout(() => setStatusMessage(''), 3000);
      });
    }
  };

  // Preset selection handler
  const handleSelectPreset = (preset: typeof BAKERY_IMAGE_PRESETS[0]) => {
    setNewImage(preset.url);
    setUploadedFileName(`Preset: ${preset.name}`);
    setUploadedFileSize('Studio High-Res');
    setStatusMessage(`Studio photo "${preset.name}" attached! 🧁`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  // Save new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;
    if (!newImage.trim()) {
      alert('Please attach a photo for your new biscuit drop babes!');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          tagline: newTagline.trim() || 'Freshly baked with love & French butter',
          description: newDesc.trim() || 'Delicious handcrafted cookie made in our Richmond Hill bakery in Port Elizabeth.',
          price: parseFloat(newPrice) || 45,
          image: newImage.trim(),
          category: newCategory,
          dietary: ['Halal Friendly', 'Vegetarian'],
          memeBadge: newBadge.trim() || undefined,
          badgeColor: '#ec4899',
          inStock: true,
          stockCount: parseInt(newStock) || 20,
          rating: 5.0,
          reviewCount: 1,
        }),
      });

      if (res.ok) {
        setStatusMessage('New delicious biscuit added to shop catalog! 🍪✨');
        setTimeout(() => setStatusMessage(''), 3000);
        setNewName('');
        setNewTagline('');
        setNewDesc('');
        setUploadedFileName('');
        setUploadedFileSize('');
        setActiveSubTab('inventory');
        onRefreshProducts();
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save updated image for an existing product
  const handleSaveProductImage = async () => {
    if (!editingProductImage || !editImageUrl.trim()) return;

    try {
      const res = await fetch(`/api/products/${editingProductImage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: editImageUrl.trim(),
        }),
      });

      if (res.ok) {
        setStatusMessage(`Updated photo for "${editingProductImage.name}"! 🎀`);
        setTimeout(() => setStatusMessage(''), 3000);
        setEditingProductImage(null);
        setEditImageUrl('');
        setEditImageFileName('');
        onRefreshProducts();
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Reset sample orders and products to original defaults?')) return;
    try {
      await fetch('/api/reset-db', { method: 'POST' });
      setStatusMessage('Bakery reset to default delicious state!');
      setTimeout(() => setStatusMessage(''), 3000);
      onRefreshProducts();
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-200 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fun text-xl font-bold">Baker's Back-of-House Portal</h2>
                <span className="bg-pink-900/80 text-pink-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  Richmond Hill HQ (PE)
                </span>
              </div>
              <p className="text-xs text-stone-400">Manage orders, ovens, stock & biscuit photography</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDatabase}
              title="Reset sample data"
              className="text-stone-400 hover:text-amber-400 p-2 rounded-xl hover:bg-stone-800 text-xs flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast Message */}
        {statusMessage && (
          <div className="bg-pink-600 text-white text-xs font-bold py-2 px-4 text-center">
            {statusMessage}
          </div>
        )}

        {/* KPI Analytics Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 border-b border-stone-200">
            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Total Sales</span>
              <span className="font-fun text-lg font-bold text-pink-600">{formatZAR(stats.totalRevenue)}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Orders Processed</span>
              <span className="font-fun text-lg font-bold text-stone-900">{stats.ordersCount}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Cookies Baked</span>
              <span className="font-fun text-lg font-bold text-stone-900">{stats.totalCookiesBaked}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Active in Queue</span>
              <span className="font-fun text-lg font-bold text-emerald-600">{stats.activeOrders} pending</span>
            </div>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-white px-4 pt-2">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`pb-2.5 px-4 font-fun text-xs font-bold border-b-2 transition ${
              activeSubTab === 'orders'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Live Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`pb-2.5 px-4 font-fun text-xs font-bold border-b-2 transition ${
              activeSubTab === 'inventory'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Bake Inventory & Photos ({products.length})
          </button>
          <button
            onClick={() => setActiveSubTab('new-product')}
            className={`pb-2.5 px-4 font-fun text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'new-product'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Biscuit Drop & Attach Image</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-100/50">
          {/* ORDERS TAB */}
          {activeSubTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-fun text-sm">No live orders in the baking queue right now.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-pink-600">{order.id}</span>
                          <span className="text-xs text-stone-400">• {formatShortDate(order.createdAt)}</span>
                        </div>
                        <h4 className="font-fun font-bold text-stone-900 text-sm">{order.customer.name}</h4>
                        <span className="text-[11px] text-stone-500">
                          {order.customer.email} • {order.customer.phone}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-fun font-extrabold text-base text-pink-600">
                          {formatZAR(order.total ?? (order as any).finalTotal ?? 0)}
                        </span>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {order.delivery?.method || 'Standard'}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {order.paymentMethod || (order as any).payment?.method || 'Card'} ({order.paymentStatus || (order as any).payment?.status || 'paid'})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress status button row */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <span className="text-[11px] font-bold text-stone-500 mr-2 shrink-0">Stage:</span>
                      {(['paid', 'baking', 'boxed', 'delivered'] as OrderStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateOrderStatus(order.id, st)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                            order.status === st
                              ? 'bg-pink-600 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {st === 'baking' ? '🔥 Baking' : st === 'boxed' ? '🎀 Boxed' : st === 'delivered' ? '✨ Done' : '💳 Paid'}
                        </button>
                      ))}
                    </div>

                    {/* Items ordered */}
                    <div className="bg-stone-50 rounded-xl p-2.5 text-xs space-y-1.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-stone-700">
                          <span>
                            <strong>{it.quantity}x</strong> {it.name}{' '}
                            {it.customMessage && (
                              <span className="text-pink-600 font-bold">
                                (Stamped: "{it.customMessage}")
                              </span>
                            )}
                          </span>
                          <span className="font-mono">{formatZAR(it.price * it.quantity)}</span>
                        </div>
                      ))}
                      {order.delivery.notes && (
                        <p className="text-[11px] text-pink-700 pt-1 border-t border-stone-100 italic">
                          Baker note: "{order.delivery.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeSubTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200">
                <div>
                  <h3 className="font-fun text-sm font-bold text-stone-900">Current Biscuit Menu & Photography</h3>
                  <p className="text-xs text-stone-500">View or swap product images, update stock availability, and manage catalog items.</p>
                </div>
                <button
                  onClick={() => setActiveSubTab('new-product')}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Biscuit</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-stone-200 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 group hover:border-pink-300 transition"
                  >
                    <div className="flex gap-3">
                      <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setEditingProductImage(product);
                            setEditImageUrl(product.image);
                            setEditImageFileName('');
                          }}
                          className="absolute inset-0 bg-stone-900/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 text-[10px] font-bold"
                          title="Change Biscuit Image"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-fun text-xs font-bold text-stone-900 truncate">
                          {product.name}
                        </h4>
                        <span className="text-[11px] font-bold text-pink-600 block">
                          {formatZAR(product.price)}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          Stock: {product.stockCount} units
                        </span>
                        {product.memeBadge && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-100">
                            {product.memeBadge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
                            product.inStock
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {product.inStock ? '● In Stock' : '✕ Sold Out'}
                        </button>

                        <button
                          onClick={() => {
                            setEditingProductImage(product);
                            setEditImageUrl(product.image);
                            setEditImageFileName('');
                          }}
                          className="text-[10px] font-bold text-stone-600 hover:text-pink-600 px-2 py-1 rounded-lg border border-stone-200 hover:border-pink-200 bg-stone-50 flex items-center gap-1 transition"
                          title="Attach new photo to this biscuit"
                        >
                          <Camera className="w-3 h-3 text-pink-500" />
                          <span>Change Photo</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-stone-400 hover:text-red-500 p-1 transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW PRODUCT TAB WITH IMAGE ATTACHMENT SECTION */}
          {activeSubTab === 'new-product' && (
            <form onSubmit={handleCreateProduct} className="max-w-2xl mx-auto space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-fun text-base font-bold text-stone-900 flex items-center gap-2">
                    <span>Create Fresh Cookie / Treat Drop</span>
                    <span className="text-[10px] bg-pink-100 text-pink-800 font-sans font-bold px-2 py-0.5 rounded-full">
                      Port Elizabeth Bakery
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Configure your biscuit recipe details, attach a photo, and publish live to customers.
                  </p>
                </div>
              </div>

              {/* Basic Biscuit Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Biscuit Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Pistachio Cardamom Shortbread"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Sassy Tagline *</label>
                  <input
                    type="text"
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    placeholder="e.g. Buttery, nutty, and unapologetically rich"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Price in ZAR (R) *</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500 font-medium"
                    >
                      <option value="stuffed-cookies">Stuffed Cookies</option>
                      <option value="mzansi-heritage">Mzansi Heritage</option>
                      <option value="bundles">Box Bundles</option>
                      <option value="custom-message">Custom Stamped</option>
                      <option value="brownies">Brownies & Blondies</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Meme Badge</label>
                    <input
                      type="text"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      placeholder="e.g. Girl Dinner / New Drop"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Initial Stock Count</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* DEDICATED IMAGE ATTACHMENT SECTION */}
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-pink-600" />
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Attach Biscuit Photography *
                    </span>
                  </div>
                  <span className="text-[10px] text-pink-600 font-semibold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                    Live Shopfront Visual
                  </span>
                </div>

                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => setImageAttachMode('upload')}
                    className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                      imageAttachMode === 'upload'
                        ? 'bg-white text-pink-600 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageAttachMode('presets')}
                    className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                      imageAttachMode === 'presets'
                        ? 'bg-white text-pink-600 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Studio Presets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageAttachMode('url')}
                    className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                      imageAttachMode === 'url'
                        ? 'bg-white text-pink-600 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Web Link</span>
                  </button>
                </div>

                {/* Option 1: File Upload / Drag & Drop */}
                {imageAttachMode === 'upload' && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-pink-500 bg-pink-50/70 scale-[1.01]'
                        : 'border-stone-300 hover:border-pink-400 bg-stone-50/60 hover:bg-pink-50/20'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">
                        Click to select photo or drag & drop here
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        PNG, JPG, WEBP from your phone or camera
                      </p>
                    </div>
                    {uploadedFileName && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mt-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-xs">{uploadedFileName} ({uploadedFileSize})</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Option 2: Curated Bakery Photography Presets */}
                {imageAttachMode === 'presets' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-stone-500">
                      Select one of our high-res professional bakery studio shots with 1 tap:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BAKERY_IMAGE_PRESETS.map((preset, idx) => {
                        const isSelected = newImage === preset.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`group rounded-xl overflow-hidden border-2 text-left transition flex flex-col bg-white ${
                              isSelected
                                ? 'border-pink-600 shadow-md ring-2 ring-pink-400/30'
                                : 'border-stone-200 hover:border-pink-300'
                            }`}
                          >
                            <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              <span className="absolute top-1 left-1 text-[9px] font-bold bg-stone-900/80 text-white px-1.5 py-0.5 rounded">
                                {preset.tag}
                              </span>
                              {isSelected && (
                                <div className="absolute inset-0 bg-pink-600/30 backdrop-blur-[1px] flex items-center justify-center">
                                  <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Attached
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <span className="text-[11px] font-bold text-stone-800 block truncate">
                                {preset.name}
                              </span>
                              <span className="text-[9px] text-stone-400 block line-clamp-1">
                                {preset.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Option 3: Direct Web URL */}
                {imageAttachMode === 'url' && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-stone-600">
                      Paste Direct Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newImage}
                        onChange={(e) => {
                          setNewImage(e.target.value);
                          setUploadedFileName('Direct Web Link');
                          setUploadedFileSize('Remote URL');
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                      />
                      {newImage && (
                        <button
                          type="button"
                          onClick={() => setNewImage('')}
                          className="px-3 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 rounded-xl hover:bg-stone-200 transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Live Attached Image Mockup Preview */}
                {newImage && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-pink-600" />
                        <span>Live Shopfront Card Preview</span>
                      </span>
                      {uploadedFileName && (
                        <span className="text-[10px] text-stone-500 font-mono">
                          {uploadedFileName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2.5 rounded-xl border border-stone-200">
                      <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                        <img
                          src={newImage}
                          alt="Biscuit Preview"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setStatusMessage('Image link failed to load. Please check URL or choose a preset.');
                          }}
                        />
                        {newBadge && (
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-pink-600 text-white px-1.5 py-0.5 rounded-full shadow-xs">
                            {newBadge}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                          {newCategory.replace('-', ' ')}
                        </span>
                        <h4 className="font-fun text-sm font-bold text-stone-900 truncate">
                          {newName || 'Untitled Biscuit'}
                        </h4>
                        <p className="text-xs text-stone-500 truncate mt-0.5">
                          {newTagline || 'Delicious handcrafted cookie'}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                          <span className="font-fun font-bold text-pink-600 text-sm">
                            {formatZAR(parseFloat(newPrice) || 45)}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                            In Stock ({newStock} units)
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex sm:flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:border-pink-400 hover:text-pink-600 transition bg-stone-50"
                        >
                          Replace Photo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Biscuit to Port Elizabeth Shop ✨</span>
              </button>
            </form>
          )}
        </div>

        {/* MODAL TO EDIT EXISTING BISCUIT'S IMAGE */}
        {editingProductImage && (
          <div className="fixed inset-0 z-60 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl border border-pink-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-fun text-sm font-bold text-stone-900">
                      Change Photo for "{editingProductImage.name}"
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      Attach a new image file or select a studio preset
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingProductImage(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl text-center text-xs">
                <button
                  type="button"
                  onClick={() => setEditImageMode('upload')}
                  className={`py-1.5 rounded-lg font-bold transition ${
                    editImageMode === 'upload' ? 'bg-white text-pink-600 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setEditImageMode('presets')}
                  className={`py-1.5 rounded-lg font-bold transition ${
                    editImageMode === 'presets' ? 'bg-white text-pink-600 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setEditImageMode('url')}
                  className={`py-1.5 rounded-lg font-bold transition ${
                    editImageMode === 'url' ? 'bg-white text-pink-600 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Web URL
                </button>
              </div>

              {editImageMode === 'upload' && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setEditIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setEditIsDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setEditIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      processImageFile(file, (dataUrl, name) => {
                        setEditImageUrl(dataUrl);
                        setEditImageFileName(name);
                      });
                    }
                  }}
                  onClick={() => editFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                    editIsDragging ? 'border-pink-500 bg-pink-50' : 'border-stone-300 hover:border-pink-400 bg-stone-50'
                  }`}
                >
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        processImageFile(file, (dataUrl, name) => {
                          setEditImageUrl(dataUrl);
                          setEditImageFileName(name);
                        });
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-7 h-7 text-pink-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-stone-800">
                    Click to browse or drag new image here
                  </p>
                  {editImageFileName && (
                    <span className="inline-block mt-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Attached: {editImageFileName}
                    </span>
                  )}
                </div>
              )}

              {editImageMode === 'presets' && (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                  {BAKERY_IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditImageUrl(preset.url);
                        setEditImageFileName(`Preset: ${preset.name}`);
                      }}
                      className={`rounded-xl overflow-hidden border-2 text-left transition ${
                        editImageUrl === preset.url ? 'border-pink-600 ring-2 ring-pink-400/30' : 'border-stone-200'
                      }`}
                    >
                      <div className="aspect-square w-full">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold p-1 block truncate text-stone-700">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {editImageMode === 'url' && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Direct Image URL</label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => {
                      setEditImageUrl(e.target.value);
                      setEditImageFileName('Custom URL');
                    }}
                    placeholder="https://..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              )}

              {/* Preview of new image */}
              {editImageUrl && (
                <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <img
                    src={editImageUrl}
                    alt="New Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-stone-400 block uppercase">New Preview</span>
                    <span className="text-xs font-bold text-stone-800 block truncate">
                      {editingProductImage.name}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Ready to save to catalog
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingProductImage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProductImage}
                  disabled={!editImageUrl.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Biscuit Photo</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
