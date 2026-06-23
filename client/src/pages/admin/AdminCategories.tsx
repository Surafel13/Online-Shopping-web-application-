import { useEffect, useMemo, useState } from 'react';
import { PageTransition } from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { Search, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { AdminLoadingState } from '../../components/shared/AdminLoadingState';
import { categoryService } from '../../services';
import type { ApiCategory } from '../../types/api';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { showError, showSuccess } from '../../redux/slices/uiSlice';
import { getApiErrorMessage } from '../../lib/errors';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export function AdminCategories() {
  const dispatch = useDispatch<AppDispatch>();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      setCategories(await categoryService.getAll());
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to load categories.')));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query),
    );
  }, [categories, search]);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (category: ApiCategory) => {
    setEditingCategory(category);
    setForm({ name: category.name, description: category.description });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory._id, form);
        dispatch(showSuccess('Category updated successfully.'));
      } else {
        await categoryService.create(form);
        dispatch(showSuccess('Category created successfully.'));
      }
      setDialogOpen(false);
      await loadCategories();
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to save category.')));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await categoryService.remove(categoryId);
      dispatch(showSuccess('Category deleted.'));
      await loadCategories();
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to delete category.')));
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-sm text-muted-foreground mt-1">Organize products into storefront collections.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between bg-muted/10">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <AdminLoadingState message="Loading categories..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y bg-card">
                  {filteredCategories.map((category) => (
                    <motion.tr key={category._id} variants={itemVariants} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-medium">{category.name}</td>
                      <td className="px-6 py-4 text-muted-foreground max-w-xl truncate">{category.description}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 border bg-background">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(category._id)}>
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
            Showing {filteredCategories.length} categories
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
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
            <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">
              {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
