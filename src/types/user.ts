export type UserRole = 'author' | 'editor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}
