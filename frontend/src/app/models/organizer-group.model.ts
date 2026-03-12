export interface OrganizerGroup {
  _id?: string;
  name: string;
  slug: string;
  type: 'club' | 'department';
  description?: string;
  image?: string;
  coverImage?: string;
  tags?: string[];
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
