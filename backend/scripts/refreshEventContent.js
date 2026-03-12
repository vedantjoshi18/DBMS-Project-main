require('dotenv').config();
const connectDB = require('../src/config/database');
const Event = require('../src/models/Event');
const OrganizerGroup = require('../src/models/OrganizerGroup');

const eventContentByTitle = {
  'HackSprint 2026': {
    description: 'A 24-hour code sprint where teams prototype impactful campus solutions in AI, productivity, and student life.',
    image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=1400'
  },
  'Campus PhotoWalk': {
    description: 'Golden-hour guided photowalk across iconic campus spots with mini challenges on composition and storytelling.',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1400'
  },
  RoboWars: {
    description: 'Design, battle, and outsmart in high-energy robot rounds judged on agility, control, and innovation.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1400'
  },
  'Open Mic Evening': {
    description: 'An evening of spoken word, poetry, and acoustic performances that celebrates student voices and stories.',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1400'
  },
  'Street Play Showcase': {
    description: 'Powerful stage-in-the-round performances focused on social themes, student expression, and public dialogue.',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1400'
  },
  'Battle of Bands': {
    description: 'Campus bands compete live across indie, rock, and fusion sets in a high-voltage night finale.',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1400'
  },
  'Startup Pitch Day': {
    description: 'Early-stage founders pitch to mentors and investors for incubation support, funding feedback, and mentorship.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400'
  },
  'Green Campus Drive': {
    description: 'Join the sustainability challenge with tree-planting, waste-segmentation games, and eco-volunteering tasks.',
    image: 'https://images.unsplash.com/photo-1498928715928-f21b8f5f5f1c?w=1400'
  },
  'AI Colloquium': {
    description: 'Faculty and industry experts unpack applied AI, responsible systems, and real-world deployment case studies.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400'
  },
  'Embedded Systems Workshop': {
    description: 'Hands-on circuit design and microcontroller prototyping session with guided debugging and hardware demos.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400'
  },
  'CAD Design Masterclass': {
    description: 'From sketch to simulation: advanced CAD modeling workflows for real mechanical design challenges.',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=1400'
  },
  'Marketing Summit': {
    description: 'Learn growth strategy, brand storytelling, and digital campaign planning from top practitioners.',
    image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=1400'
  }
};

const fallbackByCategory = {
  Technical: 'Build, experiment, and present practical technical ideas with peers and mentors.',
  Cultural: 'Celebrate creativity, performance, and expression with the campus community.',
  Sports: 'Compete with energy, discipline, and teamwork in a spirited sports event.',
  Academic: 'Dive into applied knowledge, expert talks, and thought-provoking discussions.',
  Workshop: 'Learn by doing with guided activities, hands-on sessions, and expert support.',
  Seminar: 'Gain insights from domain specialists through focused talks and interaction.',
  Competition: 'Challenge your skills in a judged format with prizes and recognition.',
  Social: 'Connect, collaborate, and contribute to positive campus engagement.',
  Other: 'A curated campus event designed for meaningful participation and learning.'
};

async function refreshEventContent() {
  try {
    await connectDB();

    const groups = await OrganizerGroup.find({}, { _id: 1, type: 1 });
    const groupTypeById = new Map(groups.map((group) => [String(group._id), group.type]));

    const events = await Event.find();
    let updatedCount = 0;

    for (const event of events) {
      const predefined = eventContentByTitle[event.title] || {};
      const fallbackDescription = fallbackByCategory[event.category] || fallbackByCategory.Other;
      const nextDescription = predefined.description || fallbackDescription;
      const nextImage = predefined.image || event.image;

      const updates = {
        description: nextDescription,
        image: nextImage
      };

      if (event.organizerGroup && !event.organizerGroupType) {
        updates.organizerGroupType = groupTypeById.get(String(event.organizerGroup));
      }

      await Event.updateOne({ _id: event._id }, { $set: updates });
      updatedCount += 1;
    }

    console.log(`Updated content for ${updatedCount} events.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to refresh event content:', error);
    process.exit(1);
  }
}

refreshEventContent();
