require('dotenv').config();
const connectDB = require('../src/config/database');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Booking = require('../src/models/Booking');
const OrganizerGroup = require('../src/models/OrganizerGroup');

const categoryMap = {
  Conference: 'Academic',
  Workshop: 'Workshop',
  Seminar: 'Seminar',
  Meetup: 'Social',
  Concert: 'Cultural',
  Sports: 'Sports'
};

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '9876543210',
    role: 'user',
    emailVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '9876543211',
    role: 'user',
    emailVerified: true
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '9876543212',
    role: 'admin',
    emailVerified: true
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    phone: '9876543213',
    role: 'user',
    emailVerified: true
  }
];

const clubs = [
  { name: 'Photography Club', slug: 'photography-club', type: 'club', description: 'Capturing moments...', tags: ['cultural', 'creative'] },
  { name: 'Robotics Club', slug: 'robotics-club', type: 'club', description: 'Building the future...', tags: ['technical'] },
  { name: 'Literary Club', slug: 'literary-club', type: 'club', description: 'Words that inspire...', tags: ['cultural', 'academic'] },
  { name: 'Coding Club', slug: 'coding-club', type: 'club', description: 'Code, build, repeat...', tags: ['technical'] },
  { name: 'Drama Club', slug: 'drama-club', type: 'club', description: 'The stage is yours...', tags: ['cultural'] },
  { name: 'Music Club', slug: 'music-club', type: 'club', description: 'Feel the rhythm...', tags: ['cultural'] },
  { name: 'Entrepreneurship Cell', slug: 'e-cell', type: 'club', description: 'Build your startup...', tags: ['business', 'technical'] },
  { name: 'Environmental Club', slug: 'green-club', type: 'club', description: 'For a sustainable campus...', tags: ['social'] }
];

const departments = [
  { name: 'Computer Science', slug: 'cs-dept', type: 'department', description: 'The future is code...', tags: ['technical'] },
  { name: 'Electronics & Communication', slug: 'ece-dept', type: 'department', description: 'Signals and systems...', tags: ['technical'] },
  { name: 'Mechanical Engineering', slug: 'mech-dept', type: 'department', description: 'Design in motion...', tags: ['technical'] },
  { name: 'Business Administration', slug: 'bba-dept', type: 'department', description: 'Leaders of tomorrow...', tags: ['business'] },
  { name: 'Physics', slug: 'physics-dept', type: 'department', description: 'Understanding the universe...', tags: ['academic'] },
  { name: 'English & Literature', slug: 'english-dept', type: 'department', description: 'The power of words...', tags: ['academic', 'cultural'] }
];

const sampleEvents = [
  {
    title: 'HackSprint 2026',
    category: 'Technical',
    groupSlug: 'coding-club',
    date: '2026-04-10T10:00:00',
    time: '10:00 AM',
    ticketPrice: 100,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLScodingclub-hacksprint/viewform',
    isHot: true,
    isFeatured: true,
    venue: 'Innovation Lab',
    image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=1400',
    description: 'A 24-hour code sprint where teams prototype impactful campus solutions in AI, productivity, and student life.'
  },
  {
    title: 'Campus PhotoWalk',
    category: 'Cultural',
    groupSlug: 'photography-club',
    date: '2026-04-12T16:00:00',
    time: '4:00 PM',
    ticketPrice: 0,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSphoto-club-photowalk/viewform',
    isHot: true,
    isFeatured: false,
    venue: 'Main Quad',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1400',
    description: 'Golden-hour guided photowalk across iconic campus spots with mini challenges on composition and storytelling.'
  },
  {
    title: 'RoboWars',
    category: 'Competition',
    groupSlug: 'robotics-club',
    date: '2026-04-18T09:00:00',
    time: '9:00 AM',
    ticketPrice: 150,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSrobotics-robowars/viewform',
    isHot: true,
    isFeatured: true,
    venue: 'Tech Arena',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1400',
    description: 'Design, battle, and outsmart in high-energy robot rounds judged on agility, control, and innovation.'
  },
  {
    title: 'Open Mic Evening',
    category: 'Cultural',
    groupSlug: 'literary-club',
    date: '2026-04-22T18:00:00',
    time: '6:00 PM',
    ticketPrice: 50,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSliterary-openmic/viewform',
    isHot: false,
    isFeatured: true,
    venue: 'Auditorium B',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1400',
    description: 'An evening of spoken word, poetry, and acoustic performances that celebrates student voices and stories.'
  },
  {
    title: 'Street Play Showcase',
    category: 'Social',
    groupSlug: 'drama-club',
    date: '2026-05-02T17:00:00',
    time: '5:00 PM',
    ticketPrice: 0,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSdrama-streetplay/viewform',
    isHot: false,
    isFeatured: false,
    venue: 'Open Theater',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1400',
    description: 'Powerful stage-in-the-round performances focused on social themes, student expression, and public dialogue.'
  },
  {
    title: 'Battle of Bands',
    category: 'Cultural',
    groupSlug: 'music-club',
    date: '2026-05-05T19:00:00',
    time: '7:00 PM',
    ticketPrice: 200,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSmusic-battleofbands/viewform',
    isHot: true,
    isFeatured: true,
    venue: 'Central Stage',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1400',
    description: 'Campus bands compete live across indie, rock, and fusion sets in a high-voltage night finale.'
  },
  {
    title: 'Startup Pitch Day',
    category: 'Competition',
    groupSlug: 'e-cell',
    date: '2026-05-11T11:00:00',
    time: '11:00 AM',
    ticketPrice: 120,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSecell-startuppitch/viewform',
    isHot: false,
    isFeatured: true,
    venue: 'Seminar Hall 2',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400',
    description: 'Early-stage founders pitch to mentors and investors for incubation support, funding feedback, and mentorship.'
  },
  {
    title: 'Green Campus Drive',
    category: 'Social',
    groupSlug: 'green-club',
    date: '2026-05-15T08:00:00',
    time: '8:00 AM',
    ticketPrice: 0,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSgreenclub-drive/viewform',
    isHot: false,
    isFeatured: false,
    venue: 'North Gate',
    image: 'https://images.unsplash.com/photo-1498928715928-f21b8f5f5f1c?w=1400',
    description: 'Join the sustainability challenge with tree-planting, waste-segmentation games, and eco-volunteering tasks.'
  },
  {
    title: 'AI Colloquium',
    category: categoryMap.Conference,
    groupSlug: 'cs-dept',
    date: '2026-05-20T10:00:00',
    time: '10:00 AM',
    ticketPrice: 250,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLScsdept-ai-colloquium/viewform',
    isHot: false,
    isFeatured: true,
    venue: 'CS Block',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400',
    description: 'Faculty and industry experts unpack applied AI, responsible systems, and real-world deployment case studies.'
  },
  {
    title: 'Embedded Systems Workshop',
    category: categoryMap.Workshop,
    groupSlug: 'ece-dept',
    date: '2026-05-27T10:30:00',
    time: '10:30 AM',
    ticketPrice: 180,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSecedept-embedded/viewform',
    isHot: false,
    isFeatured: false,
    venue: 'ECE Lab',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400',
    description: 'Hands-on circuit design and microcontroller prototyping session with guided debugging and hardware demos.'
  },
  {
    title: 'CAD Design Masterclass',
    category: categoryMap.Seminar,
    groupSlug: 'mech-dept',
    date: '2026-06-01T09:30:00',
    time: '9:30 AM',
    ticketPrice: 220,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSmech-cad-masterclass/viewform',
    isHot: false,
    isFeatured: false,
    venue: 'Mechanical Workshop',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=1400',
    description: 'From sketch to simulation: advanced CAD modeling workflows for real mechanical design challenges.'
  },
  {
    title: 'Marketing Summit',
    category: 'Academic',
    groupSlug: 'bba-dept',
    date: '2026-06-06T10:00:00',
    time: '10:00 AM',
    ticketPrice: 300,
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSbbadept-marketing-summit/viewform',
    isHot: true,
    isFeatured: false,
    venue: 'Commerce Hall',
    image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=1400',
    description: 'Learn growth strategy, brand storytelling, and digital campaign planning from top practitioners.'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting college platform seeding...');

    // Connect to database
    await connectDB();

    const shouldClearData = process.env.CLEAR_DATA !== 'false';
    if (shouldClearData) {
      await Booking.deleteMany({});
      await Event.deleteMany({});
      await OrganizerGroup.deleteMany({});
      await User.deleteMany({});
    }

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
      }
      createdUsers.push(user);
    }

    const groupsInput = [...clubs, ...departments];
    const groupsBySlug = {};
    for (const groupData of groupsInput) {
      let group = await OrganizerGroup.findOne({ slug: groupData.slug });
      if (!group) {
        group = await OrganizerGroup.create(groupData);
      }
      groupsBySlug[group.slug] = group;
    }

    const createdEvents = [];
    for (const eventData of sampleEvents) {
      const group = groupsBySlug[eventData.groupSlug];
      const organizer = createdUsers[0];

      if (!group) {
        continue;
      }

      const event = await Event.create({
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        date: new Date(eventData.date),
        time: eventData.time,
        location: {
          venue: eventData.venue,
          address: 'Christ University Kengeri Campus',
          city: 'Bengaluru'
        },
        organizer: organizer._id,
        organizerGroup: group._id,
        organizerGroupType: group.type,
        maxAttendees: 250,
        currentAttendees: 0,
        ticketPrice: eventData.ticketPrice,
        registrationLink: eventData.registrationLink,
        image: eventData.image,
        status: 'upcoming',
        isHot: eventData.isHot,
        isFeatured: eventData.isFeatured
      });
      createdEvents.push(event);
    }

    const bookings = [];

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
    }

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
    }

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
    }

    console.log(`Users: ${createdUsers.length}`);
    console.log(`Organizer Groups: ${Object.keys(groupsBySlug).length}`);
    console.log(`Events: ${createdEvents.length}`);
    console.log(`Bookings: ${bookings.length}`);
    console.log('Seed completed successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
