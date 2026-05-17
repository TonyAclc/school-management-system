import { LoaderFunction, redirect } from 'react-router';
import { useAuthStore, RoleName } from '../store/auth-store';

export const requireAuthLoader: LoaderFunction = ({ request }) => {
  const { status } = useAuthStore.getState();
  if (status !== 'authenticated') {
    const url = new URL(request.url);
    return redirect(`/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return null;
};

export const requireRolesLoader = (...allowed: RoleName[]): LoaderFunction => () => {
  const { status, user } = useAuthStore.getState();
  if (status !== 'authenticated' || !user) {
    return redirect('/login');
  }
  if (!user.roles.some(r => allowed.includes(r))) {
    return redirect('/forbidden');
  }
  return null;
};

export const redirectIfAuthenticatedLoader: LoaderFunction = ({ request }) => {
  if (useAuthStore.getState().status === 'authenticated') {
    const url = new URL(request.url);
    return redirect(url.searchParams.get('redirect') ?? '/dashboard');
  }
  return null;
};
