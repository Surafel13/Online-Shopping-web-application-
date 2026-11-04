import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AlertCircle, KeyRound, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { AdminAccessDialog } from "../../features/superadmin/AdminAccessDialog";
import { PermissionMatrix } from "../../features/superadmin/PermissionMatrix";
import { togglePermission } from "../../features/superadmin/permissionUtils";
import { superAdminService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { PERMISSION_MODULES, summarizePermissionCodes } from "../../lib/permissions";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { AppDispatch } from "../../redux/store";
import type { ApiAdmin, ApiPermission, ApiRole } from "../../types/api";

const emptyPerm = { name: "", module: "products", action: "", description: "" };
const emptyRole = { name: "", description: "" };
const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export function PermissionsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [admins, setAdmins] = useState<ApiAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // permission dialog
  const [permOpen, setPermOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<ApiPermission | null>(null);
  const [permForm, setPermForm] = useState(emptyPerm);
  const [permErrors, setPermErrors] = useState<Record<string, string>>({});
  // role dialog
  const [roleOpen, setRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ApiRole | null>(null);
  const [roleForm, setRoleForm] = useState(emptyRole);
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({});
  const [rolePerms, setRolePerms] = useState<Set<string>>(new Set());

  const [isSaving, setIsSaving] = useState(false);
  const [accessAdmin, setAccessAdmin] = useState<ApiAdmin | null>(null);
  const [toDelete, setToDelete] = useState<{ kind: "permission" | "role"; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, r, a] = await Promise.all([
        superAdminService.listPermissions(),
        superAdminService.listRoles(),
        superAdminService.listAdmins(),
      ]);
      setPermissions(p); setRoles(r); setAdmins(a); setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load permissions."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    load();
  }, [load]);

  // ---------- permissions ----------
  const openPerm = (perm?: ApiPermission) => {
    setEditingPerm(perm ?? null);
    setPermForm(perm ? { name: perm.name, module: perm.module, action: perm.action, description: perm.description } : emptyPerm);
    setPermErrors({});
    setPermOpen(true);
  };

  const savePerm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (permForm.name.trim().length < 3) errs.name = "Name must be at least 3 characters.";
    if (!/^[a-z][a-z0-9_-]{1,29}$/.test(permForm.action.trim().toLowerCase()))
      errs.action = "2-30 chars: letters, numbers, - or _ (start with a letter).";
    setPermErrors(errs);
    if (Object.keys(errs).length) return;

    setIsSaving(true);
    try {
      const payload = {
        name: permForm.name.trim(),
        description: permForm.description.trim(),
        ...(editingPerm?.isSystem ? {} : { module: permForm.module, action: permForm.action.trim().toLowerCase() }),
      };
      if (editingPerm) await superAdminService.updatePermission(editingPerm._id, payload);
      else await superAdminService.createPermission({ ...payload, module: permForm.module, action: permForm.action.trim().toLowerCase() });
      dispatch(showSuccess(editingPerm ? "Permission updated." : "Permission created."));
      setPermOpen(false);
      await load();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to save permission.")));
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- roles ----------
  const openRole = (role?: ApiRole) => {
    setEditingRole(role ?? null);
    setRoleForm(role ? { name: role.name, description: role.description } : emptyRole);
    setRolePerms(new Set(role?.permissions.map((p) => p._id) ?? []));
    setRoleErrors({});
    setRoleOpen(true);
  };

  const saveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roleForm.name.trim().length < 2) { setRoleErrors({ name: "Name must be at least 2 characters." }); return; }
    setRoleErrors({});
    setIsSaving(true);
    try {
      const payload = { name: roleForm.name.trim(), description: roleForm.description.trim(), permissionIds: [...rolePerms] };
      if (editingRole) await superAdminService.updateRole(editingRole._id, payload);
      else await superAdminService.createRole(payload);
      dispatch(showSuccess(editingRole ? "Role updated." : "Role created."));
      setRoleOpen(false);
      await load();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to save role.")));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      if (toDelete.kind === "permission") await superAdminService.deletePermission(toDelete.id);
      else await superAdminService.deleteRole(toDelete.id);
      dispatch(showSuccess(`${toDelete.kind === "permission" ? "Permission" : "Role"} deleted.`));
      setToDelete(null);
      await load();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Delete failed.")));
      setToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && permissions.length === 0) {
    return <PageTransition><AdminLoadingState message="Loading permissions..." /></PageTransition>;
  }
  if (error && permissions.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto py-24 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-5">{error}</p>
          <Button onClick={load} className="bg-blue-600 hover:bg-blue-700"><RefreshCw className="h-4 w-4 mr-2" /> Try again</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Permissions Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define permissions and roles, then assign them to admins. The server enforces every permission.
          </p>
        </div>

        <Tabs defaultValue="permissions">
          <TabsList className="mb-4">
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="access">Admin Access</TabsTrigger>
          </TabsList>

          {/* PERMISSIONS */}
          <TabsContent value="permissions">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-muted/10">
                <p className="text-sm text-muted-foreground">{permissions.length} permissions</p>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openPerm()}><Plus className="h-4 w-4 mr-2" /> New Permission</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                    <tr>
                      <th className="px-6 py-4">Permission</th><th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Type</th><th className="px-6 py-4">Used by</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {permissions.map((p) => (
                      <tr key={p._id} className="hover:bg-muted/40">
                        <td className="px-6 py-3">
                          <div className="font-medium">{p.name}</div>
                          {p.description && <div className="text-xs text-muted-foreground">{p.description}</div>}
                        </td>
                        <td className="px-6 py-3 font-mono text-xs">{p.code}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isSystem ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {p.isSystem ? "System" : "Custom"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{p.roleCount ?? 0} roles · {p.adminCount ?? 0} admins</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 border" aria-label="Edit permission" onClick={() => openPerm(p)}><Pencil className="h-4 w-4" /></Button>
                            {!p.isSystem && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 border text-red-600" aria-label="Delete permission"
                                onClick={() => setToDelete({ kind: "permission", id: p._id, name: p.name })}><Trash2 className="h-4 w-4" /></Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ROLES */}
          <TabsContent value="roles">
            <div className="flex justify-end mb-4">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openRole()}><Plus className="h-4 w-4 mr-2" /> New Role</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {roles.map((role) => (
                <div key={role._id} className="bg-card border rounded-xl shadow-sm p-5">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {role.name}
                        {role.isSystem && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">System</span>}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{role.description || "No description"}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!role.isSystem && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 border" aria-label="Edit role" onClick={() => openRole(role)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 border text-red-600" aria-label="Delete role"
                            onClick={() => setToDelete({ kind: "role", id: role._id, name: role.name })}><Trash2 className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                  <PermissionChips codes={role.permissions.map((p) => p.code)} />
                  <p className="text-xs text-muted-foreground mt-3">{role.adminCount ?? 0} admin(s) assigned</p>
                </div>
              ))}
              {roles.length === 0 && <p className="text-sm text-muted-foreground">No roles yet.</p>}
            </div>
          </TabsContent>

          {/* ADMIN ACCESS */}
          <TabsContent value="access">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                    <tr><th className="px-6 py-4">Admin</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Assigned permissions</th><th className="px-6 py-4 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {admins.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">No admins yet.</td></tr>}
                    {admins.map((a) => (
                      <tr key={a._id} className="align-top hover:bg-muted/40">
                        <td className="px-6 py-4"><div className="font-medium">{a.username}</div><div className="text-xs text-muted-foreground">{a.email}</div></td>
                        <td className="px-6 py-4">{a.adminRole?.name ?? <span className="text-muted-foreground">None</span>}</td>
                        <td className="px-6 py-4"><PermissionChips codes={a.effectivePermissions} /></td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => setAccessAdmin(a)}><KeyRound className="h-4 w-4 mr-2" /> Manage</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Permission dialog */}
      <Dialog open={permOpen} onOpenChange={(v) => !isSaving && setPermOpen(v)}>
        <DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editingPerm ? "Edit Permission" : "New Permission"}</DialogTitle></DialogHeader>
          <form onSubmit={savePerm} className="space-y-4 pt-2" noValidate>
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={permForm.name} onChange={(e) => setPermForm({ ...permForm, name: e.target.value })} />
              {permErrors.name && <p className="text-xs text-red-600 mt-1">{permErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Module</label>
                <select className={selectCls} disabled={editingPerm?.isSystem} value={permForm.module}
                  onChange={(e) => setPermForm({ ...permForm, module: e.target.value })}>
                  {PERMISSION_MODULES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Action</label>
                <Input placeholder="e.g. export" disabled={editingPerm?.isSystem} value={permForm.action}
                  onChange={(e) => setPermForm({ ...permForm, action: e.target.value })} />
                {permErrors.action && <p className="text-xs text-red-600 mt-1">{permErrors.action}</p>}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Code: <span className="font-mono">{permForm.module}:{permForm.action.trim().toLowerCase() || "…"}</span>
              {editingPerm?.isSystem && " (system permissions keep their code)"}
            </p>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input value={permForm.description} onChange={(e) => setPermForm({ ...permForm, description: e.target.value })} />
            </div>
            <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">
              {isSaving ? "Saving..." : editingPerm ? "Save changes" : "Create permission"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role dialog */}
      <Dialog open={roleOpen} onOpenChange={(v) => !isSaving && setRoleOpen(v)}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editingRole ? "Edit Role" : "New Role"}</DialogTitle></DialogHeader>
          <form onSubmit={saveRole} className="space-y-4 pt-2" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Role name</label>
                <Input value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} />
                {roleErrors.name && <p className="text-xs text-red-600 mt-1">{roleErrors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} />
              </div>
            </div>
            <PermissionMatrix permissions={permissions} selected={rolePerms}
              onToggle={(p) => setRolePerms((s) => togglePermission(s, p, permissions))} />
            <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">
              {isSaving ? "Saving..." : editingRole ? "Save role" : "Create role"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {accessAdmin && (
        <AdminAccessDialog key={accessAdmin._id} admin={accessAdmin} roles={roles} permissions={permissions}
          onClose={() => setAccessAdmin(null)} onSaved={load} />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete ${toDelete?.kind ?? ""}`}
        description={
          toDelete?.kind === "permission"
            ? `"${toDelete.name}" will be removed from every role and admin that uses it.`
            : `Delete the role "${toDelete?.name}"? Roles assigned to admins can't be deleted.`
        }
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </PageTransition>
  );
}

function PermissionChips({ codes }: { codes: string[] }) {
  const groups = summarizePermissionCodes(codes);
  if (groups.length === 0) return <span className="text-xs text-muted-foreground">No permissions</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {groups.map((g) => (
        <span key={g.label} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs">
          <strong className="font-semibold">{g.label}:</strong> {g.actions.join(", ")}
        </span>
      ))}
    </div>
  );
}
