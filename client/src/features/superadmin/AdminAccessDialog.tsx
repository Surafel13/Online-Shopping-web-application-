import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { PermissionMatrix } from "./PermissionMatrix";
import { togglePermission } from "./permissionUtils";
import { superAdminService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { AppDispatch } from "../../redux/store";
import type { ApiAdmin, ApiPermission, ApiRole } from "../../types/api";

interface Props {
  admin: ApiAdmin;
  roles: ApiRole[];
  permissions: ApiPermission[];
  onClose: () => void;
  onSaved: () => void;
}

/** Render with key={admin._id} so state initialises from props. */
export function AdminAccessDialog({
  admin,
  roles,
  permissions,
  onClose,
  onSaved,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [roleId, setRoleId] = useState(admin.adminRole?._id ?? "");
  const [direct, setDirect] = useState(
    new Set(admin.directPermissions.map((p) => p._id)),
  );
  const [isSaving, setIsSaving] = useState(false);

  const inherited = useMemo(() => {
    const role = roles.find((r) => r._id === roleId);
    return new Set((role?.permissions ?? []).map((p) => p._id));
  }, [roles, roleId]);

  const save = async () => {
    setIsSaving(true);
    try {
      await superAdminService.updateAdminAccess(admin._id, {
        roleId: roleId || null,
        permissionIds: [...direct],
      });
      dispatch(showSuccess("Access updated."));
      onSaved();
      onClose();
    } catch (error) {
      dispatch(
        showError(getApiErrorMessage(error, "Failed to update access.")),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && !isSaving && onClose()}>
      <DialogContent
        className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>Manage access: {admin.username}</DialogTitle>
        </DialogHeader>

        <div>
          <label className="text-sm font-medium mb-1 block">Role</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">No role (direct permissions only)</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Permissions from the role are shown locked. Add direct permissions
            on top.
          </p>
        </div>

        <PermissionMatrix
          permissions={permissions}
          selected={direct}
          inherited={inherited}
          onToggle={(p) =>
            setDirect((s) => togglePermission(s, p, permissions))
          }
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={save}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save access"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
