import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromToken, isTokenExpired } from '@/utils/jwt';

// Маршрути, які не потребують автентифікації
const publicRoutes = [
  '/',
  '/signin',
  '/signup',
  '/events',
  '/events/[id]',
  '/about',
  '/contact'
];

// Маршрути, доступні тільки для адміністраторів
const adminRoutes = ['/admin'];

// Маршрути, доступні тільки для організаторів
const organizerRoutes = ['/events/create', '/events/edit'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаємо публічні маршрути
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Отримуємо токен з куків
  const token = request.cookies.get('token')?.value;

  // Якщо немає токена і маршрут не публічний, перенаправляємо на сторінку входу
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Перевіряємо термін дії токена
  if (isTokenExpired(token)) {
    const response = NextResponse.redirect(new URL('/auth/signin', request.url));
    response.cookies.delete('token');
    return response;
  }

  // Отримуємо інформацію про користувача з токена
  const user = getUserFromToken(token);
  if (!user || !user.role) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Перевіряємо доступ до адмін-маршрутів
  if (adminRoutes.some(route => pathname.startsWith(route)) && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Перевіряємо доступ до маршрутів організатора
  if (organizerRoutes.some(route => pathname.startsWith(route)) && 
      user.role !== 'organizer' && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

// Конфігурація для маршрутів, де middleware повинен виконуватися
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 