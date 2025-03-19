import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is initialized (not loading) and there's no user, redirect to login
    if (!loading && !user) {
      router.push({
        pathname: '/auth/login',
        query: { returnUrl: router.asPath },
      });
    }
  }, [loading, user, router]);

  // Show loading state while auth is being initialized
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the protected content
  return user ? children : null;
}

// HOC to wrap protected pages
export function withProtectedRoute(WrappedComponent) {
  return function ProtectedPage(props) {
    return (
      <ProtectedRoute>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

// HOC to wrap public-only pages (like login/register that shouldn't be accessed when authenticated)
export function withPublicRoute(WrappedComponent) {
  return function PublicPage(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If auth is initialized and user is logged in, redirect to dashboard
      if (!loading && user) {
        router.replace('/dashboard');
      }
    }, [loading, user, router]);

    // Show loading state while auth is being initialized
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      );
    }

    // If user is not authenticated, render the public page
    return !user ? <WrappedComponent {...props} /> : null;
  };
}

// Example usage:
// For protected pages:
// export default withProtectedRoute(DashboardPage);
//
// For public-only pages:
// export default withPublicRoute(LoginPage);