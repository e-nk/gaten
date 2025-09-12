// Shared TypeScript types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
}

export interface Course {
  id: string;
  title: string;
  description: string;
}
