import { OrganizerGroup } from './organizer-group.model';

export interface Event {
  _id?: string;
  id?: number; // For backward compatibility
  title: string;
  date: string | Date;
  time?: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Academic' | 'Workshop' | 'Seminar' | 'Competition' | 'Social' | 'Other';
  ticketPrice: number;
  price?: number; // For backward compatibility
  registrationLink?: string;
  description: string;
  image: string;
  isFeatured?: boolean;
  isHot?: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'open' | 'sold-out'; // Support both formats
  location?: {
    venue: string;
    address: string;
    city: string;
  };
  organizer?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  organizerGroup?: OrganizerGroup | string;
  organizerGroupType?: 'club' | 'department';
  maxAttendees: number;
  currentAttendees?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}