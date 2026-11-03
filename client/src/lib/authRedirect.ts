import type { AuthUser } from "../redux/slices/authSlice";

export function getPostAuthRedirect(
  user: Pick<AuthUser, "role">,
  requestedPath?: string,
): string {
  if (user.role === "super_admin") {
    if (
      requestedPath?.startsWith("/super-admin") ||
      requestedPath?.startsWith("/admin")
    ) {
      return requestedPath;
    }
    return "/super-admin/overview";
  }

  if (user.role === "admin") {
    if (requestedPath?.startsWith("/admin")) return requestedPath;
    return "/admin/overview";
  }

  if (
    requestedPath &&
    requestedPath !== "/login" &&
    requestedPath !== "/register" &&
    !requestedPath.startsWith("/admin") &&
    !requestedPath.startsWith("/super-admin")
  ) {
    return requestedPath;
  }

  return "/";
}
