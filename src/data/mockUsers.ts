export interface MockUser {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email: string;
  password: string; // Used ONLY for frontend mock validation; NEVER saved to session/storage
  role: 'ADMIN' | 'CUSTOMER';
  roleTitle: string;
  initials: string;
}

export const BASE_DEMO_USERS: MockUser[] = [
  {
    id: 'usr-admin-01',
    name: 'Admin User',
    company: 'PrimeRoute Global Operations',
    phone: '+91 98000 00000',
    email: 'admin@primeroute.com',
    password: 'Admin@PrimeRoute2026!',
    role: 'ADMIN',
    roleTitle: 'Super Admin',
    initials: 'AU',
  },
  {
    id: 'usr-cust-01',
    name: 'Rohan Mehta',
    company: 'Acme Retail Ltd',
    phone: '+91 98450 11234',
    email: 'customer@primeroute.com',
    password: 'customer123',
    role: 'CUSTOMER',
    roleTitle: 'Verified Business',
    initials: 'RM',
  },
  {
    id: 'usr-cust-02',
    name: 'Rohan Mehta',
    company: 'Acme Retail Ltd',
    phone: '+91 98450 11234',
    email: 'rohan.mehta@acme.com',
    password: 'customer123',
    role: 'CUSTOMER',
    roleTitle: 'Verified Business',
    initials: 'RM',
  },
];

export const DEMO_USERS_STORAGE_KEY = 'primeroute_demo_users';

export function getRegisteredDemoUsers(): MockUser[] {
  try {
    const raw = localStorage.getItem(DEMO_USERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as MockUser[];
    }
  } catch (err) {
    console.error('Error reading registered demo users:', err);
  }
  return [];
}

export function getAllDemoUsers(): MockUser[] {
  const registered = getRegisteredDemoUsers();
  return [...BASE_DEMO_USERS, ...registered];
}

export function registerNewDemoUser(user: {
  name: string;
  company: string;
  email: string;
  phone: string;
  password: string;
}): { success: boolean; error?: string; user?: MockUser } {
  const allUsers = getAllDemoUsers();
  const normalizedEmail = user.email.trim().toLowerCase();

  const existing = allUsers.find(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );
  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists.',
    };
  }

  // Calculate initials from full name
  const nameParts = user.name.trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : user.name.slice(0, 2).toUpperCase();

  const newUser: MockUser = {
    id: `demo-user-${Date.now()}`,
    name: user.name.trim(),
    company: user.company.trim() || 'Logistics Partner',
    phone: user.phone.trim(),
    email: normalizedEmail,
    password: user.password,
    role: 'CUSTOMER', // All registrations are strictly CUSTOMER accounts
    roleTitle: user.company.trim() || 'Verified Business',
    initials: initials || 'CU',
  };

  try {
    const current = getRegisteredDemoUsers();
    current.push(newUser);
    localStorage.setItem(DEMO_USERS_STORAGE_KEY, JSON.stringify(current));
    return { success: true, user: newUser };
  } catch (err) {
    console.error('Error saving registered demo user:', err);
    return { success: false, error: 'Could not save account to demo storage.' };
  }
}
