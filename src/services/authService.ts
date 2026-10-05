import api from './api';

// ── Types ──────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'CUSTOMER' | 'WAREHOUSE_MANAGER' | 'DRIVER';

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  roleTitle?: string;
  initials?: string;
  warehouseId?: number;
  warehouseCode?: string;
  warehouseName?: string;
}

export interface LoginResult {
  success: boolean;
  user?: AuthSessionUser;
  error?: string;
}

export interface RegisterData {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  user?: AuthSessionUser;
  error?: string;
}

export interface ForgotPasswordResult {
  success: boolean;
  message?: string;
  resetUrl?: string;
  error?: string;
}

export interface ForgotPasswordApiResponse {
  success?: boolean;
  message?: string;
  resetUrl?: string;
  token?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message?: string;
  email?: string;
  role?: UserRole;
  error?: string;
}

// ── Storage keys ───────────────────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ── Backend response ───────────────────────────────────────────────────────

interface LoginApiResponse {
  token: string;
  email: string;
  fullName?: string;
  role: string;
  warehouseId?: number;
  warehouseCode?: string;
  warehouseName?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function formatDisplayName(fullName?: string, email?: string): string {
  if (fullName && fullName.trim() && !fullName.includes('@')) {
    return fullName.trim();
  }

  if (email && email.includes('@')) {
    const usernamePart = email.split('@')[0];
    const cleaned = usernamePart
      .replace(/[._-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2');

    const formatted = cleaned
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    if (formatted) return formatted;
  }

  return fullName || email || 'Customer';
}

export function getUserInitials(name: string): string {
  if (!name) return 'PR';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function normalizeRole(role: string): UserRole {
  if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
    return 'ADMIN';
  }
  if (role === 'ROLE_WAREHOUSE_MANAGER' || role === 'WAREHOUSE_MANAGER') {
    return 'WAREHOUSE_MANAGER';
  }
  if (role === 'ROLE_DRIVER' || role === 'DRIVER') {
    return 'DRIVER';
  }

  return 'CUSTOMER';
}

// ── Auth Service ───────────────────────────────────────────────────────────

export const authService = {

  /**
   * Login using Spring Boot JWT API.
   *
   * POST /api/auth/login
   */
  async login(
    email: string,
    password: string
  ): Promise<LoginResult> {

    try {
      const cleanEmail = email ? email.trim().toLowerCase() : '';

      const response = await api.post<LoginApiResponse>(
        '/auth/login',
        {
          email: cleanEmail,
          password,
        }
      );

      const {
        token,
        email: responseEmail,
        fullName: responseFullName,
        role,
        warehouseId,
        warehouseCode,
        warehouseName,
      } = response.data;

      const normalizedRole = normalizeRole(role);
      const displayName = formatDisplayName(responseFullName, responseEmail);
      const initials = getUserInitials(displayName);

      const user: AuthSessionUser = {
        id: '',
        email: responseEmail,
        name: displayName,
        initials: initials,
        role: normalizedRole,
        roleTitle: normalizedRole === 'WAREHOUSE_MANAGER' ? 'Warehouse Manager' : normalizedRole === 'ADMIN' ? 'Operations Admin' : 'Customer',
        warehouseId,
        warehouseCode,
        warehouseName,
      };

      // Store token temporarily.
      // saveSession() in AuthContext will decide
      // whether it should remain in localStorage
      // or sessionStorage.
      sessionStorage.setItem(TOKEN_KEY, token);

      return {
        success: true,
        user,
      };

    } catch (err: unknown) {

      const axiosErr = err as {
        response?: {
          status?: number;
          data?: string | {
            message?: string;
          };
        };
      };

      const status = axiosErr.response?.status;
      const responseData = axiosErr.response?.data;

      const serverMessage =
        typeof responseData === 'string'
          ? responseData
          : responseData?.message;

      const message =
        serverMessage ??
        (status === 401
          ? 'Invalid email or password.'
          : status
            ? `Server error (${status}). Please try again.`
            : 'Unable to connect to the server. Please check that the backend is running.');

      return {
        success: false,
        error: message,
      };
    }
  },

  /**
 * Customer registration.
 *
 * POST /api/auth/register
 */
  async register(
    data: RegisterData
  ): Promise<RegisterResult> {

    try {

      const response = await api.post<string>(
        '/auth/register',
        {
          fullName: data.fullName,
          companyName: data.companyName,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }
      );

      return {
        success: true,
      };

    } catch (err: unknown) {

      const axiosErr = err as {
        response?: {
          status?: number;
          data?: string | { message?: string };
        };
      };

      const responseData = axiosErr.response?.data;

      const message =
        typeof responseData === 'string'
          ? responseData
          : responseData?.message;

      return {
        success: false,
        error:
          message ??
          'Unable to create your account. Please try again.',
      };
    }
  },

  /**
 * Request a password reset.
 *
 * POST /api/auth/forgot-password
 */
  async forgotPassword(
    email: string
  ): Promise<ForgotPasswordResult> {

    try {
      const cleanEmail = email ? email.trim().toLowerCase() : '';

      const response = await api.post<ForgotPasswordApiResponse>(
        '/auth/forgot-password',
        {
          email: cleanEmail,
        }
      );

      const data = response.data;
      const message = typeof data === 'string' ? data : data?.message;
      const resetUrl = typeof data === 'object' && data ? data.resetUrl : undefined;

      return {
        success: true,
        message,
        resetUrl,
      };

    } catch (err: unknown) {

      const axiosErr = err as {
        response?: {
          status?: number;
          data?: string | { message?: string };
        };
      };

      const responseData = axiosErr.response?.data;

      const message =
        typeof responseData === 'string'
          ? responseData
          : responseData?.message;

      return {
        success: false,
        error:
          message ??
          'Unable to process your request. Please try again.',
      };
    }
  },

  /**
 * Reset password using a valid reset token.
 *
 * POST /api/auth/reset-password
 */
  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword?: string
  ): Promise<ResetPasswordResult> {

    try {

      const response = await api.post<any>(
        '/auth/reset-password',
        {
          token,
          newPassword,
          confirmPassword: confirmPassword ?? newPassword,
        }
      );

      const respData = response.data;
      const email = typeof respData === 'object' && respData ? respData.email : undefined;
      const rawRole = typeof respData === 'object' && respData ? respData.role : undefined;
      const role = rawRole ? normalizeRole(rawRole) : undefined;
      const message = typeof respData === 'string' ? respData : respData?.message || 'Password reset successfully.';

      return {
        success: true,
        message,
        email,
        role,
      };

    } catch (err: unknown) {

      const axiosErr = err as {
        response?: {
          status?: number;
          data?: string | { message?: string };
        };
      };

      const responseData = axiosErr.response?.data;

      const message =
        typeof responseData === 'string'
          ? responseData
          : responseData?.message;

      return {
        success: false,
        error:
          message ??
          'Unable to reset your password. Please try again.',
      };
    }
  },

  /**
   * Saves the authenticated user and JWT.
   */
  saveSession(
    user: AuthSessionUser,
    rememberMe: boolean
  ): void {

    const storage = rememberMe
      ? localStorage
      : sessionStorage;

    const token =
      sessionStorage.getItem(TOKEN_KEY) ??
      localStorage.getItem(TOKEN_KEY);

    if (token) {
      storage.setItem(TOKEN_KEY, token);
    }

    storage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );

    // Remove duplicate temporary session data
    // when remember me is enabled.
    if (rememberMe) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Restores the logged-in user after page refresh, verifying token validity.
   */
  getSession(): AuthSessionUser | null {
    try {
      const token =
        localStorage.getItem(TOKEN_KEY) ??
        sessionStorage.getItem(TOKEN_KEY);

      const raw =
        localStorage.getItem(USER_KEY) ??
        sessionStorage.getItem(USER_KEY);

      if (!token || !raw) {
        this.clearSession();
        return null;
      }

      // Validate JWT token expiration
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            this.clearSession();
            return null;
          }
        }
      } catch {
        // If decoding fails, proceed with raw user check
      }

      const parsed = JSON.parse(raw) as AuthSessionUser;
      if (parsed) {
        parsed.name = formatDisplayName(parsed.name, parsed.email);
        parsed.initials = getUserInitials(parsed.name);
      }
      return parsed;

    } catch {
      return null;
    }
  },

  /**
   * Updates partial fields in the stored session user.
   */
  updateUser(updatedFields: Partial<AuthSessionUser>): AuthSessionUser | null {
    try {
      const current = this.getSession();
      if (!current) return null;

      const updated: AuthSessionUser = {
        ...current,
        ...updatedFields,
      };

      if (updatedFields.name) {
        updated.name = formatDisplayName(updatedFields.name, updated.email);
        updated.initials = getUserInitials(updated.name);
      }

      const isLocalStorage = !!localStorage.getItem(USER_KEY);
      const storage = isLocalStorage ? localStorage : sessionStorage;
      storage.setItem(USER_KEY, JSON.stringify(updated));

      return updated;
    } catch {
      return null;
    }
  },

  /**
   * Clears JWT and user information.
   */
  clearSession(): void {

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};