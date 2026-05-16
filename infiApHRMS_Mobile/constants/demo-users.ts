// Demo users for local development/testing
// Each user has predefined credentials and a role

export type UserRole = 'employee';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string; // initials
  department: string;
  designation: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'emp-001',
    name: 'Sneha Desai',
    email: 'sneha@infiap.com',
    password: '123456',
    role: 'employee',
    avatar: 'SD',
    department: 'Engineering',
    designation: 'Senior Product Designer',
  },
];

/**
 * Authenticate a demo user by email, password, and role.
 * Returns the user if credentials match, otherwise null.
 */
export function authenticateDemoUser(
  email: string,
  password: string
): DemoUser | null {
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}
