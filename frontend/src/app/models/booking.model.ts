export interface Booking {
  _id?: string;
  id?: number; // For backward compatibility
  event: string | {
    _id: string;
    title: string;
    date?: string | Date;
    time?: string;
    location?: {
      venue: string;
      address: string;
      city: string;
    };
    category?: string;
    image?: string;
  };
  eventId?: number; // For backward compatibility
  eventTitle?: string; // For backward compatibility
  user: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  userEmail?: string; // For backward compatibility
  userName?: string; // For backward compatibility
  numberOfTickets: number;
  tickets?: number; // For backward compatibility
  totalAmount: number;
  bookingStatus: 'confirmed' | 'cancelled' | 'pending';
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  bookingReference?: string;
  bookingDate?: Date; // For backward compatibility
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}