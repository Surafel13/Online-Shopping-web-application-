import type { AuthUser } from '../redux/slices/authSlice';

export function getPostAuthRedirect(
  user: Pick<AuthUser, 'role'>,
  requestedPath?: string,
): string {
  if (user.role === 'admin') {
    if (requestedPath?.startsWith('/admin')) return requestedPath;
    return '/admin/overview';
  }

  if (
    requestedPath &&
    requestedPath !== '/login' &&
    requestedPath !== '/register' &&
    !requestedPath.startsWith('/admin')
  ) {
    return requestedPath;
  }

  return '/';
}
