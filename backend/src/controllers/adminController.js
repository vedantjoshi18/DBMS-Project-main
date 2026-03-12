const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const OrganizerGroup = require('../models/OrganizerGroup');
const { logAdminAction } = require('../utils/auditLog');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalClubs = await OrganizerGroup.countDocuments({ type: 'club' });
        const totalDepartments = await OrganizerGroup.countDocuments({ type: 'department' });

        // Calculate total revenue
        const bookings = await Booking.find();
        const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.totalAmount || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue,
                totalClubs,
                totalDepartments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const deletedUserId = user._id;
        const deletedUserEmail = user.email;
        const deletedUserRole = user.role;

        await user.deleteOne();

        await logAdminAction({
            admin: req.user,
            action: 'user.delete',
            targetType: 'User',
            targetId: deletedUserId,
            req,
            metadata: {
                deletedUserEmail,
                deletedUserRole
            }
        });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

exports.getGroupStats = async (req, res) => {
    try {
        const totalClubs = await OrganizerGroup.countDocuments({ type: 'club' });
        const totalDepartments = await OrganizerGroup.countDocuments({ type: 'department' });

        const groups = await OrganizerGroup.find().sort({ name: 1 });
        const eventsByGroup = await Event.aggregate([
            {
                $match: {
                    organizerGroup: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$organizerGroup',
                    count: { $sum: 1 }
                }
            }
        ]);

        const countMap = new Map(eventsByGroup.map((item) => [String(item._id), item.count]));
        const groupStats = groups.map((group) => ({
            _id: group._id,
            name: group.name,
            slug: group.slug,
            type: group.type,
            eventCount: countMap.get(String(group._id)) || 0
        }));

        res.status(200).json({
            success: true,
            data: {
                totalClubs,
                totalDepartments,
                groups: groupStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching group stats',
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
        res.status(error.name === 'ValidationError' ? 400 : 500).json({
            success: false,
            message: error.name === 'ValidationError' ? 'Validation failed' : 'Error creating group',
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
        res.status(error.name === 'ValidationError' ? 400 : 500).json({
            success: false,
            message: error.name === 'ValidationError' ? 'Validation failed' : 'Error updating group',
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
            message: 'Error deleting group',
            error: error.message
        });
    }
};
