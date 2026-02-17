import Availability from '../models/Availability.js';
import User from '../models/User.js';

// @desc    Get teacher's availability
// @route   GET /api/availability/:teacherId
// @access  Public
export const getTeacherAvailability = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { date } = req.query;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || !teacher.isTeacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (date) {
      // Get availability for specific date
      const targetDate = new Date(date);
      const availability = await Availability.getAvailabilityForDate(teacherId, targetDate);

      return res.status(200).json({
        success: true,
        date: targetDate,
        availability
      });
    } else {
      // Get weekly availability
      const availability = await Availability.getWeeklyAvailability(teacherId);

      return res.status(200).json({
        success: true,
        weekly: true,
        availability
      });
    }
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching availability',
      error: error.message
    });
  }
};

// @desc    Create/Update availability
// @route   POST /api/availability
// @access  Private (Teacher)
export const setAvailability = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const {
      dayOfWeek,
      timeSlots,
      specificDate,
      isRecurring,
      timezone,
      skills,
      notes
    } = req.body;

    // Validate teacher
    if (!req.user.isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can set availability'
      });
    }

    // Validate input
    if (!dayOfWeek && !specificDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either dayOfWeek or specificDate'
      });
    }

    if (!timeSlots || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one time slot'
      });
    }

    // Check if availability already exists
    const query = specificDate
      ? { teacher: teacherId, specificDate: new Date(specificDate) }
      : { teacher: teacherId, dayOfWeek, isRecurring: true };

    let availability = await Availability.findOne(query);

    if (availability) {
      // Update existing
      availability.timeSlots = timeSlots;
      availability.timezone = timezone || availability.timezone;
      availability.skills = skills || availability.skills;
      availability.notes = notes || availability.notes;
      availability.isActive = true;
      await availability.save();
    } else {
      // Create new
      availability = await Availability.create({
        teacher: teacherId,
        dayOfWeek: specificDate ? new Date(specificDate).getDay() : dayOfWeek,
        timeSlots,
        specificDate: specificDate ? new Date(specificDate) : null,
        isRecurring: isRecurring !== undefined ? isRecurring : !specificDate,
        timezone: timezone || req.user.timeZone || 'UTC',
        skills,
        notes
      });
    }

    res.status(availability.isNew ? 201 : 200).json({
      success: true,
      message: `Availability ${availability.isNew ? 'created' : 'updated'} successfully`,
      availability
    });
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting availability',
      error: error.message
    });
  }
};

// @desc    Get my availability (as teacher)
// @route   GET /api/availability/my
// @access  Private (Teacher)
export const getMyAvailability = async (req, res) => {
  try {
    const teacherId = req.user._id;

    if (!req.user.isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can view their availability'
      });
    }

    const availability = await Availability.find({
      teacher: teacherId,
      isActive: true
    }).sort({ dayOfWeek: 1 });

    res.status(200).json({
      success: true,
      count: availability.length,
      availability
    });
  } catch (error) {
    console.error('Get my availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching availability',
      error: error.message
    });
  }
};

// @desc    Update availability status
// @route   PUT /api/availability/:id/status
// @access  Private (Teacher)
export const updateAvailabilityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const teacherId = req.user._id;

    const availability = await Availability.findOne({
      _id: id,
      teacher: teacherId
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability not found'
      });
    }

    availability.isActive = isActive;
    await availability.save();

    res.status(200).json({
      success: true,
      message: `Availability ${isActive ? 'activated' : 'deactivated'}`,
      availability
    });
  } catch (error) {
    console.error('Update availability status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability status',
      error: error.message
    });
  }
};

// @desc    Delete availability
// @route   DELETE /api/availability/:id
// @access  Private (Teacher)
export const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user._id;

    const availability = await Availability.findOneAndDelete({
      _id: id,
      teacher: teacherId
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Availability deleted successfully'
    });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting availability',
      error: error.message
    });
  }
};

// @desc    Initialize default availability for teacher
// @route   POST /api/availability/default
// @access  Private (Teacher)
export const createDefaultAvailability = async (req, res) => {
  try {
    const teacherId = req.user._id;

    if (!req.user.isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create availability'
      });
    }

    // Check if teacher already has availability
    const existing = await Availability.findOne({ teacher: teacherId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Availability already exists. Use update endpoint instead.'
      });
    }

    const timezone = req.body.timezone || req.user.timeZone || 'UTC';
    const availability = await Availability.createDefaultAvailability(teacherId, timezone);

    res.status(201).json({
      success: true,
      message: 'Default availability created successfully',
      count: availability.length,
      availability
    });
  } catch (error) {
    console.error('Create default availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating default availability',
      error: error.message
    });
  }
};

// @desc    Get available time slots for booking
// @route   GET /api/availability/:teacherId/slots
// @access  Public
export const getAvailableSlots = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { date, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }

    const targetDate = new Date(date);
    const availability = await Availability.getAvailabilityForDate(teacherId, targetDate);

    if (!availability) {
      return res.status(200).json({
        success: true,
        date: targetDate,
        availableSlots: []
      });
    }

    // Filter out booked slots
    const availableSlots = availability.timeSlots.filter(slot => !slot.isBooked);

    res.status(200).json({
      success: true,
      date: targetDate,
      availableSlots,
      totalSlots: availability.timeSlots.length,
      bookedSlots: availability.timeSlots.length - availableSlots.length
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message
    });
  }
};
