require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Booking = require('../src/models/Booking');

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '9876543210',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '9876543211',
    role: 'user'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '9876543212',
    role: 'admin'
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    phone: '9876543213',
    role: 'user'
  }
];

const sampleEvents = [
  {
    title: 'Tech Conference 2026',
    description: 'Join us for an exciting tech conference featuring the latest innovations in software development, AI, and cloud computing. Network with industry leaders and learn from expert speakers.',
    category: 'Conference',
    date: new Date('2026-03-15T10:00:00'),
    time: '10:00 AM - 6:00 PM',
    location: {
      venue: 'Convention Center',
      address: '123 Tech Street',
      city: 'Bangalore'
    },
    maxAttendees: 500,
    currentAttendees: 0,
    ticketPrice: 1500,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    status: 'upcoming'
  },
  {
    title: 'Angular Workshop',
    description: 'Hands-on workshop on Angular framework. Learn about components, services, routing, and state management. Perfect for developers looking to enhance their frontend skills.',
    category: 'Workshop',
    date: new Date('2026-03-20T14:00:00'),
    time: '2:00 PM - 5:00 PM',
    location: {
      venue: 'Tech Hub',
      address: '456 Innovation Road',
      city: 'Bangalore'
    },
    maxAttendees: 50,
    currentAttendees: 0,
    ticketPrice: 500,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    status: 'upcoming'
  },
  {
    title: 'Music Festival',
    description: 'Experience an amazing music festival with performances from top artists. Food, drinks, and great music await you!',
    category: 'Concert',
    date: new Date('2026-04-10T18:00:00'),
    time: '6:00 PM - 11:00 PM',
    location: {
      venue: 'Open Air Arena',
      address: '789 Music Lane',
      city: 'Bangalore'
    },
    maxAttendees: 2000,
    currentAttendees: 0,
    ticketPrice: 2000,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    status: 'upcoming'
  },
  {
    title: 'Business Networking Meetup',
    description: 'Connect with entrepreneurs, investors, and business professionals. Share ideas and build valuable connections.',
    category: 'Meetup',
    date: new Date('2026-03-25T19:00:00'),
    time: '7:00 PM - 9:00 PM',
    location: {
      venue: 'Business Center',
      address: '321 Corporate Avenue',
      city: 'Bangalore'
    },
    maxAttendees: 100,
    currentAttendees: 0,
    ticketPrice: 300,
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
    status: 'upcoming'
  },
  {
    title: 'Web Development Seminar',
    description: 'Learn about modern web development practices, best practices, and emerging technologies. Perfect for both beginners and experienced developers.',
    category: 'Seminar',
    date: new Date('2026-04-05T09:00:00'),
    time: '9:00 AM - 1:00 PM',
    location: {
      venue: 'Education Center',
      address: '654 Learning Street',
      city: 'Bangalore'
    },
    maxAttendees: 200,
    currentAttendees: 0,
    ticketPrice: 800,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    status: 'upcoming'
  },
  {
    title: 'Marathon Run',
    description: 'Join us for a fun and healthy marathon run. Multiple categories available: 5K, 10K, and Half Marathon. All participants get a medal and t-shirt.',
    category: 'Sports',
    date: new Date('2026-04-20T06:00:00'),
    time: '6:00 AM - 10:00 AM',
    location: {
      venue: 'City Park',
      address: '987 Fitness Road',
      city: 'Bangalore'
    },
    maxAttendees: 1000,
    currentAttendees: 0,
    ticketPrice: 600,
    image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
    status: 'upcoming'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - set CLEAR_DATA=false in .env to skip)
    const shouldClearData = process.env.CLEAR_DATA !== 'false';
    if (shouldClearData) {
      console.log('🗑️  Clearing existing data...');
      await Booking.deleteMany({});
      await Event.deleteMany({});
      await User.deleteMany({});
      console.log('✅ Existing data cleared\n');
    } else {
      console.log('⚠️  Skipping data clearing (CLEAR_DATA=false)\n');
    }

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      // Check if user already exists
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`   ✓ Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`   ⊙ User already exists: ${user.email}`);
      }
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create events
    console.log('📅 Creating events...');
    const createdEvents = [];
    for (const eventData of sampleEvents) {
      // Assign organizer (use first user as organizer)
      const organizer = createdUsers[0];
      const event = await Event.create({
        ...eventData,
        organizer: organizer._id
      });
      console.log(`   ✓ Created event: ${event.title}`);
      createdEvents.push(event);
    }
    console.log(`✅ Created ${createdEvents.length} events\n`);

    // Create bookings
    console.log('🎫 Creating bookings...');
    const bookings = [];
    
    // User 1 books event 1
    if (createdUsers[0] && createdEvents[0]) {
      const booking1 = await Booking.create({
        event: createdEvents[0]._id,
        user: createdUsers[0]._id,
        numberOfTickets: 2,
        totalAmount: createdEvents[0].ticketPrice * 2,
        bookingStatus: 'confirmed',
        paymentStatus: 'paid'
      });
      createdEvents[0].currentAttendees += 2;
      await createdEvents[0].save();
      bookings.push(booking1);
      console.log(`   ✓ ${createdUsers[0].name} booked ${createdEvents[0].title} (2 tickets)`);
    }

    // User 2 books event 2
    if (createdUsers[1] && createdEvents[1]) {
      const booking2 = await Booking.create({
        event: createdEvents[1]._id,
        user: createdUsers[1]._id,
        numberOfTickets: 1,
        totalAmount: createdEvents[1].ticketPrice,
        bookingStatus: 'confirmed',
        paymentStatus: 'paid'
      });
      createdEvents[1].currentAttendees += 1;
      await createdEvents[1].save();
      bookings.push(booking2);
      console.log(`   ✓ ${createdUsers[1].name} booked ${createdEvents[1].title} (1 ticket)`);
    }

    // User 3 books event 3
    if (createdUsers[2] && createdEvents[2]) {
      const booking3 = await Booking.create({
        event: createdEvents[2]._id,
        user: createdUsers[2]._id,
        numberOfTickets: 3,
        totalAmount: createdEvents[2].ticketPrice * 3,
        bookingStatus: 'confirmed',
        paymentStatus: 'pending'
      });
      createdEvents[2].currentAttendees += 3;
      await createdEvents[2].save();
      bookings.push(booking3);
      console.log(`   ✓ ${createdUsers[2].name} booked ${createdEvents[2].title} (3 tickets)`);
    }

    console.log(`✅ Created ${bookings.length} bookings\n`);

    // Summary
    console.log('📊 Seeding Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Events: ${createdEvents.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   User: john@example.com / password123');
    console.log('   User: jane@example.com / password123');
    console.log('   Admin: admin@example.com / admin123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
