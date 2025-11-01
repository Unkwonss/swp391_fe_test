import { User } from './types';

const API_URL = 'http://localhost:8080/api';

// JWT Token Management
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
  // Also set in cookie for middleware
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
}

export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  // Remove cookie
  document.cookie = 'token=; path=/; max-age=0';
  
  // Dispatch custom event so components can react
  // Use setTimeout to avoid dispatching during render
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('tokenRemoved'));
    }, 0);
  }
}

// Decode JWT
export function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() / 1000 > decoded.exp;
}

// Get current user from token
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const token = getToken();
  if (!token) {
    removeToken(); // Clean up any stale userData
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('⚠️ Token expired in getCurrentUser(), removing...');
    removeToken();
    return null;
  }
  
  const userData = localStorage.getItem('userData');
  if (!userData) {
    // Token exists but no userData - something is wrong
    removeToken();
    return null;
  }
  
  try {
    return JSON.parse(userData);
  } catch {
    removeToken();
    return null;
  }
}

// Check user role
export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

export function isAdmin(): boolean {
  return hasRole('ADMIN') || hasRole('MODERATOR');
}

export function isUser(): boolean {
  const user = getCurrentUser();
  return user !== null;
}

// Login
export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Đăng nhập thất bại');
  }

  const data = await res.json();
  // Backend returns: { userId, userName, userEmail, phone, userStatus, dob, role, token }
  setToken(data.token);
  
  // Transform backend response to User format
  const user: User = {
    userID: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    phone: data.phone,
    role: data.role?.roleName || data.role,
    userStatus: data.userStatus,
  };
  
  localStorage.setItem('userData', JSON.stringify(user));
  return user;
}

// Register
export async function register(userData: {
  userName: string;
  userEmail: string;
  password: string;
  phone: string;
}): Promise<User> {
  // Backend expects 'userPassword' not 'password'
  const requestBody = {
    userName: userData.userName,
    userEmail: userData.userEmail,
    userPassword: userData.password,  // Map password → userPassword
    phone: userData.phone,
  };

  const res = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Đăng ký thất bại');
  }

  return await res.json();
}

// Logout
export function logout() {
  removeToken();
  window.location.href = '/login';
}

// Helper: Get role name from role object or string
export function getRoleName(role: any): string {
  if (typeof role === 'string') return role;
  if (role && typeof role === 'object' && role.roleName) return role.roleName;
  return 'USER';
}

// Helper: Sync token from localStorage to cookies (for existing users)
export function syncTokenToCookie() {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('token');
  if (token) {
    // Check if cookie already exists
    const cookies = document.cookie.split(';');
    const hasTokenCookie = cookies.some(c => c.trim().startsWith('token='));
    
    if (!hasTokenCookie) {
      // Sync to cookie
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      console.log('Token synced to cookie');
    }
  }
}
