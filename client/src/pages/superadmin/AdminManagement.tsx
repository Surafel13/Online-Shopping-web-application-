import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  AlertCircle, Ban, CheckCircle2, Eye, KeyRound, MoreHorizontal, Pencil, Plus,
  RefreshCw, Search, ShieldOff,
} from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { AdminAccessDialog } from "../../features/superadmin/AdminAccessDialog";
import { PermissionMatrix } from "../../features/superadmin/PermissionMatrix";
import { superAdminService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { formatOrderDate } from "../../lib/mappers";
import { summarizePermissionCodes } from "../../lib/permissions";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { AppDispatch } from "../../redux/store";
import type { AdminStatus, ApiAdmin, ApiPermission, ApiRole } from "../../types/api";

const STATUS_STYLES: Record<AdminStatus, { cls: string; label: string }> = {
  active: { cls: "bg-green-100 text-green-700", label: "Active" },
  suspended: { cls: "bg-amber-100 text-amber-700", label: "Suspended" },
  inactive: { cls: "bg-slate-100 text-slate-700", label: "Inactive" },
};

const STATUS_COPY: Record<AdminStatus, { title: string; verb: string; body: string; danger: boolean }> = {
  active: { title: "Activate admin", verb: "Activate", body: "will regain access to the admin dashboard based on their permissions.", danger: false },
  suspended: { title: "Suspend admin", verb: "Suspend", body: "will be blocked from the dashboard immediately until reactivated.", danger: true },
  inactive: { title: "Deactivate admin", verb: "Deactivate", body: "will be blocked from signing in until an account is reactivated.", danger: true },
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const emptyForm = { username: "", email: "", password: "", roleId: "", status: "active" as AdminStatus };

export function AdminManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const [admins, setAdmins] = useState<ApiAdmin[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminStatus>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiAdmin | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [details, setDetails] = useState<ApiAdmin | null>(null);
  const [accessAdmin, setAccessAdmin] = useState<ApiAdmin | null>(null);
  const [pending, setPending] = useState<{ admin: ApiAdmin; status: AdminStatus } | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [a, r, p] = await Promise.all([
        superAdminService.listAdmins(),
        superAdminService.listRoles(),
        superAdminService.listPermissions(),
      ]);
      setAdmins(a); setRoles(r); setPermissions(p); setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load admins."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return admins.filter(
      (a) =>
        (statusFilter === "all" || a.status === statusFilter) &&
        (a.username.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)),
    );
  }, [admins, search, statusFilter]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFieldErrors({}); setFormOpen(true); };
  const openEdit = (admin: ApiAdmin) => {
    setEditing(admin);
    setForm({ ...emptyForm, username: admin.username, email: admin.email, status: admin.status });
    setFieldErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.username.trim().length < 2) errs.username = "Name must be at least 2 characters.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Enter a valid email address.";
    if (!editing && form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (editing && form.password && form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (editing) {
        await superAdminService.updateAdmin(editing._id, {
          username: form.username.trim(),
          email: form.email.trim(),
          ...(form.password ? { password: form.password } : {}),
        });
        dispatch(showSuccess("Admin updated."));
      } else {
        await superAdminService.createAdmin({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          status: form.status,
          roleId: form.roleId || null,
          permissionIds: [],
        });
        dispatch(showSuccess("Admin created."));
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to save admin.")));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmStatus = async () => {
    if (!pending) return;
    setIsChanging(true);
    try {
      await superAdminService.updateAdminStatus(pending.admin._id, pending.status);
      dispatch(showSuccess(`Admin ${STATUS_STYLES[pending.status].label.toLowerCase()}.`));
      setPending(null);
      await load();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to change status.")));
    } finally {
      setIsChanging(false);
    }
  };

  const field = (key: keyof typeof emptyForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Create admins, control their status and assign access.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Admin
          </Button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-wrap gap-3 items-center justify-between bg-muted/10">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
              aria-label="Filter by status"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | AdminStatus)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {isLoading ? (
            <AdminLoadingState message="Loading admins..." />
          ) : error ? (
            <div className="py-16 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={load} className="bg-blue-600 hover:bg-blue-700"><RefreshCw className="h-4 w-4 mr-2" /> Try again</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Admin</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Permissions</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y bg-card">
                  {visible.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      {admins.length === 0 ? "No admin accounts yet." : "No admins match your filters."}
                    </td></tr>
                  )}
                  {visible.map((admin) => (
                    <motion.tr key={admin._id} variants={itemVariants} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                            {admin.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{admin.username}</div>
                            <div className="text-xs text-muted-foreground">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{admin.adminRole?.name ?? <span className="text-muted-foreground">None</span>}</td>
                      <td className="px-6 py-4 text-muted-foreground">{admin.effectivePermissions.length} granted</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[admin.status].cls}`}>
                          {STATUS_STYLES[admin.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatOrderDate(admin.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 border bg-background" aria-label="Admin actions">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetails(admin)}><Eye className="h-4 w-4 mr-2" /> View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(admin)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAccessAdmin(admin)}><KeyRound className="h-4 w-4 mr-2" /> Manage access</DropdownMenuItem>
                            {admin.status !== "active" && (
                              <DropdownMenuItem onClick={() => setPending({ admin, status: "active" })}>
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Activate
                              </DropdownMenuItem>
                            )}
                            {admin.status !== "suspended" && (
                              <DropdownMenuItem className="text-amber-600" onClick={() => setPending({ admin, status: "suspended" })}>
                                <Ban className="h-4 w-4 mr-2" /> Suspend
                              </DropdownMenuItem>
                            )}
                            {admin.status !== "inactive" && (
                              <DropdownMenuItem className="text-red-600" onClick={() => setPending({ admin, status: "inactive" })}>
                                <ShieldOff className="h-4 w-4 mr-2" /> Deactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
          <div className="p-4 border-t text-sm text-muted-foreground bg-muted/10">Showing {visible.length} of {admins.length} admins</div>
        </div>
      </div>

      {/* Create / edit */}
      <Dialog open={formOpen} onOpenChange={(v) => !isSaving && setFormOpen(v)}>
        <DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editing ? "Edit Admin" : "Add Admin"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2" noValidate>
            <div>
              <label className="text-sm font-medium mb-1 block">Full name</label>
              <Input {...field("username")} />
              {fieldErrors.username && <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input type="email" {...field("email")} />
              {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {editing ? "New password (leave blank to keep)" : "Password"}
              </label>
              <Input type="password" autoComplete="new-password" {...field("password")} />
              {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
            </div>
            {!editing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Role</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                    <option value="">No role</option>
                    {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AdminStatus })}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}
            <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">
              {isSaving ? "Saving..." : editing ? "Save changes" : "Create admin"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details */}
      <Dialog open={!!details} onOpenChange={(v) => !v && setDetails(null)}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          {details && (
            <>
              <DialogHeader><DialogTitle>{details.username}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Email" value={details.email} />
                <Info label="Status" value={STATUS_STYLES[details.status].label} />
                <Info label="Role" value={details.adminRole?.name ?? "None"} />
                <Info label="Created" value={formatOrderDate(details.createdAt)} />
                <Info label="Last updated" value={formatOrderDate(details.updatedAt)} />
                <Info label="Direct permissions" value={String(details.directPermissions.length)} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Effective permissions</h4>
                <PermissionMatrix
                  permissions={permissions}
                  selected={new Set(permissions.filter((p) => details.effectivePermissions.includes(p.code)).map((p) => p._id))}
                  disabled
                />
                {summarizePermissionCodes(details.effectivePermissions).length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">This admin has no permissions assigned.</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {accessAdmin && (
        <AdminAccessDialog
          key={accessAdmin._id}
          admin={accessAdmin}
          roles={roles}
          permissions={permissions}
          onClose={() => setAccessAdmin(null)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(v) => !v && setPending(null)}
        title={pending ? STATUS_COPY[pending.status].title : ""}
        description={pending ? `${pending.admin.username} ${STATUS_COPY[pending.status].body}` : ""}
        confirmLabel={pending ? STATUS_COPY[pending.status].verb : "Confirm"}
        tone={pending && STATUS_COPY[pending.status].danger ? "danger" : "default"}
        isLoading={isChanging}
        onConfirm={confirmStatus}
      />
    </PageTransition>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
