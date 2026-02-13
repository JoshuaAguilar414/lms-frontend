import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth redirect is disabled for frontend-only development.
 * When you add auth, redirect unauthenticated users from / to /restricted here
 * (e.g. if (!isAuthenticated && pathname === '/') return redirect to /restricted).
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}
