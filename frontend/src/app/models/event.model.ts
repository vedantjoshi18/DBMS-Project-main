export interface Event {
  _id?: string;
  id?: number; // For backward compatibility
  title: string;
  date: string | Date;
  time?: string;
  category: string;
  ticketPrice: number;
  price?: number; // For backward compatibility
  description: string;
  image: string;
  isFeatured?: boolean;
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
  maxAttendees: number;
  currentAttendees?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}