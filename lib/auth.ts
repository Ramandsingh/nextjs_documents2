'use server';

import { hash, compare } from 'bcryptjs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const USERS_FILE_PATH = join(process.cwd(), 'data', 'users.json');
const SESSION_COOKIE_NAME = 'session';

interface User {
  id: string;
  username: string;
  passwordHash: string;
}

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  console.log('Auth: Attempting login for username:', username);

  if (!username || !password) {
    console.log('Auth: Username or password missing.');
    return { error: 'Username and password are required.' };
  }

  const DEFAULT_USERNAME = process.env.DEFAULT_USERNAME;
  const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;

  console.log('Auth: Loaded DEFAULT_USERNAME:', DEFAULT_USERNAME);
  // WARNING: Do NOT log DEFAULT_PASSWORD in production!
  // console.log('Auth: Loaded DEFAULT_PASSWORD:', DEFAULT_PASSWORD);

  if (!DEFAULT_USERNAME || !DEFAULT_PASSWORD) {
    console.error('Auth: DEFAULT_USERNAME or DEFAULT_PASSWORD not set in .env.local');
    return { error: 'Authentication not configured.' };
  }

  if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
    console.log('Auth: Credentials match default user.');
    const userId = 'default-user-id';

    (await cookies()).set(SESSION_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    console.log('Auth: Session cookie set. Redirecting to /');
    redirect('/');
  } else {
    console.log('Auth: Invalid username or password provided.');
    return { error: 'Invalid username or password.' };
  }
}

export async function logout() {
  console.log('Auth: Logging out.');
  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export async function isAuthenticated(): Promise<boolean> {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  console.log('Auth: Checking authentication. Session ID:', sessionId);
  return sessionId === 'default-user-id';
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (sessionId === 'default-user-id') {
    console.log('Auth: Current user is default user.');
    return {
      id: 'default-user-id',
      username: process.env.DEFAULT_USERNAME || 'default',
      passwordHash: '',
    };
  }
  console.log('Auth: No current user (not default).');
  return null;
}
