import { useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { supportService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { useAppDispatch } from "../../hooks/useRedux";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { Faq } from "../../types/support";

const empty = { question: "", answer: "", category: "General", sortOrder: 0, isPublished: true };

export function AdminFaqManager() {
  const dispatch = useAppDispatch();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState(empty);
  const [isSaving, setIsSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Faq | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let current = true;
    supportService
      .adminFaqs()
      .then((data) => current && setFaqs(data))
      .catch((err: unknown) => current && dispatch(showError(getApiErrorMessage(err, "Failed to load FAQs."))))
      .finally(() => current && setIsLoading(false));
    return () => {
      current = false;
    };
  }, [reloadKey, dispatch]);

  const reload = () => setReloadKey((k) => k + 1);

  const openDialog = (faq?: Faq) => {
    setEditing(faq ?? null);
    setForm(faq ? { question: faq.question, answer: faq.answer, category: faq.category, sortOrder: faq.sortOrder, isPublished: faq.isPublished } : empty);
    setOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...form, question: form.question.trim(), answer: form.answer.trim(), category: form.category.trim() || "General" };
      if (editing) await supportService.updateFaq(editing._id, payload);
      else await supportService.createFaq(payload);
      dispatch(showSuccess(editing ? "FAQ updated." : "FAQ created."));
      setOpen(false);
      reload();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to save FAQ.")));
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async (faq: Faq) => {
    try {
      await supportService.updateFaq(faq._id, { isPublished: !faq.isPublished });
      reload();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to update FAQ.")));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await supportService.removeFaq(toDelete._id);
      dispatch(showSuccess("FAQ deleted."));
      setToDelete(null);
      reload();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to delete FAQ.")));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/10 p-4">
        <p className="text-sm text-muted-foreground">{faqs.length} FAQs</p>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => openDialog()}><Plus className="h-4 w-4" /> Add FAQ</Button>
      </div>
      {isLoading ? (
        <AdminLoadingState message="Loading FAQs..." />
      ) : faqs.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">No FAQs yet. Add your first one.</p>
      ) : (
        <ul className="divide-y">
          {faqs.map((faq) => (
            <li key={faq._id} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium">{faq.question}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{faq.answer}</p>
                <p className="mt-2 text-xs">
                  <span className="rounded-md bg-muted px-2 py-0.5 font-medium">{faq.category}</span>
                  <span className={faq.isPublished ? "ml-2 text-emerald-600" : "ml-2 text-muted-foreground"}>{faq.isPublished ? "Published" : "Hidden"}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 border" aria-label={faq.isPublished ? "Hide FAQ" : "Publish FAQ"} onClick={() => void togglePublish(faq)}>
                  {faq.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 border" aria-label="Edit FAQ" onClick={() => openDialog(faq)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 border text-red-600" aria-label="Delete FAQ" onClick={() => setToDelete(faq)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={(v) => !isSaving && setOpen(v)}>
        <DialogContent className="sm:max-w-[560px]" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Question</label>
              <Input required minLength={5} maxLength={300} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Answer</label>
              <textarea required minLength={5} maxLength={5000} rows={5} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <Input required minLength={2} maxLength={40} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sort order</label>
                <Input type="number" min={0} max={9999} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published
            </label>
            <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">{isSaving ? "Saving..." : editing ? "Save changes" : "Create FAQ"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete FAQ"
        description={`"${toDelete?.question ?? ""}" will be permanently removed.`}
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
