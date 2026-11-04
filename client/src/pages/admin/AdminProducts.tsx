import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Package, Boxes } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { AdminLoadingState } from '../../components/shared/AdminLoadingState';
import { categoryService, productService } from '../../services';
import { buildCategoryMap } from '../../lib/mappers';
import type { ApiCategory, ApiProduct } from '../../types/api';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { showError, showSuccess } from '../../redux/slices/uiSlice';
import { getApiErrorMessage } from '../../lib/errors';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const emptyForm = {
  name: '',
  description: '',
  price: '',
  purchasePrice: '',
  category: '',
  stock: '',
};

const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0) {
    return <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-medium">Out of stock</span>;
  }
  if (stock < 10) {
    return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-xs font-medium">{stock} left</span>;
  }
  return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-xs font-medium">{stock} in stock</span>;
};

export function AdminProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(productData);
      setCategories(categoryData);
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to load products.')));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([productService.getAll(), categoryService.getAll()])
      .then(([productData, categoryData]) => {
        if (!isCurrent) return;
        setProducts(productData);
        setCategories(categoryData);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          dispatch(showError(getApiErrorMessage(error, 'Failed to load products.')));
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(query) ||
      categoryMap.get(String(product.category))?.toLowerCase().includes(query),
    );
  }, [products, search, categoryMap]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm({
      ...emptyForm,
      category: categories[0]?._id || '',
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product: ApiProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      purchasePrice: String(product.purchasePrice ?? ''),
      category: String(product.category),
      stock: String(product.stock),
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('purchasePrice', form.purchasePrice);
      formData.append('category', form.category);
      formData.append('stock', form.stock);
      if (imageFile) formData.append('image', imageFile);

      if (editingProduct) {
        await productService.update(editingProduct._id, formData);
        dispatch(showSuccess('Product updated successfully.'));
      } else {
        await productService.create(formData);
        dispatch(showSuccess('Product created successfully.'));
      }

      setDialogOpen(false);
      await loadData();
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to save product.')));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await productService.remove(productId);
      dispatch(showSuccess('Product deleted.'));
      await loadData();
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to delete product.')));
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your catalog inventory and pricing.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between bg-muted/20">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9 bg-background"
                placeholder="Search products or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Boxes className="h-4 w-4" />
              <span>{filteredProducts.length} of {products.length} products</span>
            </div>
          </div>

          {isLoading ? (
            <AdminLoadingState message="Loading products..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y bg-card">
                  {filteredProducts.map((product) => (
                    <motion.tr key={product._id} variants={itemVariants} className="hover:bg-muted/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg overflow-hidden bg-muted border shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[220px]">{product.name}</div>
                            <Link to={`/product/${product._id}`} className="text-xs text-blue-600 hover:underline">View storefront</Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                          {categoryMap.get(String(product.category)) || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold tabular-nums">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4"><StockBadge stock={product.stock} /></td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 border bg-background opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product._id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t text-sm text-muted-foreground bg-muted/10">
            Showing {filteredProducts.length} products
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Price</label>
                <Input type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Purchase Price</label>
                <Input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Stock</label>
                <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Product Image</label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>
            <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">
              {isSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
