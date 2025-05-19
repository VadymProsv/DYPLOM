'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAppSelector } from '@/store'; // Assuming auth state is in Redux store
import { useState } from 'react'; // Import useState

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // Get user from auth service or Redux store
  // Assuming user is stored in authService or Redux store after login
  // const user = authService.getUser(); // Or use useAppSelector if user is in Redux auth slice
  const { user } = useAppSelector(state => state.auth); // If using Redux
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');

    console.log('ProtectedLayout checkAuth:');
    console.log('Current user:', user);
    console.log('Is admin route:', isAdminRoute);

    if (!user) {
      console.log('No user found, redirecting to signin.');
      router.push('/signin');
      return;
    } else {
      setIsLoading(false); // Set loading to false when user is loaded
    }

    // Only protect admin routes - redirect non-admin users trying to access admin routes
    if (isAdminRoute && user.role !== 'admin') {
      console.log('User is not admin, but trying to access admin route. Redirecting to home.');
      router.push('/');
      return;
    }

    console.log('Access granted.');

  }, [user, router]); // Add user to dependency array

  // Render children only when not loading
  if (isLoading) {
    return <div>Завантаження...</div>; // Or your preferred loading indicator
  }

  return (
    <>
      <AdminLinkInLayout />
      {children}
    </>
  );
}

// Add conditional rendering for admin link in layout
const AdminLinkInLayout = () => {
  const { user } = useAppSelector(state => state.auth);
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true); // Add state for visibility

  // Check if the current route is the home page and if the user is admin
  const isHomePage = window.location.pathname === '/';
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  // Only show for admin users on the home page and if not closed
  if (user && user.role === 'admin' && isHomePage && !isAdminRoute && isVisible) {
    return (
      <div className="container mx-auto px-4 py-2 bg-yellow-100 text-yellow-800 flex justify-between items-center">
        Ви увійшли як адміністратор. <button onClick={() => router.push('/admin')} className="underline mr-4">Перейти на панель адміністратора</button>
        <button onClick={() => setIsVisible(false)} className="text-yellow-800 hover:text-yellow-900">
          &times; {/* HTML entity for multiplication sign/cross */}
        </button>
      </div>
    );
  }
  return null;
}; 