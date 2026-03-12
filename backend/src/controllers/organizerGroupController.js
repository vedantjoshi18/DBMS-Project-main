const Event = require('../models/Event');
const OrganizerGroup = require('../models/OrganizerGroup');

exports.getAllGroups = async (req, res) => {
  try {
    const query = {};

    if (req.query.type && ['club', 'department'].includes(req.query.type)) {
      query.type = req.query.type;
    }

    const groups = await OrganizerGroup.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching organizer groups',
      error: error.message
    });
  }
};

exports.getGroupBySlug = async (req, res) => {
  try {
    const group = await OrganizerGroup.findOne({ slug: req.params.slug });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Organizer group not found'
      });
    }

    const recentEvents = await Event.find({ organizerGroup: group._id })
      .sort({ date: -1 })
      .limit(5)
      .populate('organizerGroup', 'name slug type image coverImage tags');

    res.status(200).json({
      success: true,
      data: {
        ...group.toObject(),
        recentEvents
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching organizer group',
      error: error.message
    });
  }
};

exports.getEventsByGroup = async (req, res) => {
  try {
    const group = await OrganizerGroup.findOne({ slug: req.params.slug });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Organizer group not found'
      });
    }

    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { organizerGroup: group._id };

    if (req.query.status === 'upcoming') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('organizerGroup', 'name slug type image coverImage tags');

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events by group',
      error: error.message
    });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      tags: Array.isArray(req.body.tags)
        ? req.body.tags
        : String(req.body.tags || '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
    };

    const group = await OrganizerGroup.create(payload);

    res.status(201).json({
      success: true,
      message: 'Organizer group created successfully',
      data: group
    });
  } catch (error) {
    const status = error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? 'Validation failed' : 'Error creating organizer group',
      error: error.message
    });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const payload = {
      ...req.body
    };

    if (payload.tags && !Array.isArray(payload.tags)) {
      payload.tags = String(payload.tags)
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    const group = await OrganizerGroup.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Organizer group not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Organizer group updated successfully',
      data: group
    });
  } catch (error) {
    const status = error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? 'Validation failed' : 'Error updating organizer group',
      error: error.message
    });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await OrganizerGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Organizer group not found'
      });
    }

    const linkedEvents = await Event.countDocuments({ organizerGroup: group._id });

    if (linkedEvents > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organizer group with existing events'
      });
    }

    await group.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Organizer group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting organizer group',
      error: error.message
    });
  }
};
