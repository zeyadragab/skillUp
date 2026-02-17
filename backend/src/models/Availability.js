import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: true
  },
  endTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }
});

const availabilitySchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Day of week availability
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    required: true,
    min: 0,
    max: 6
  },

  // Time slots for this day
  timeSlots: [timeSlotSchema],

  // Specific date override (for special availability on a specific date)
  specificDate: Date, // If set, this overrides dayOfWeek

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Timezone
  timezone: {
    type: String,
    default: 'UTC'
  },

  // Repeat settings
  isRecurring: {
    type: Boolean,
    default: true
  },
  validFrom: Date,
  validUntil: Date,

  // Skills available during this time
  skills: [{
    type: String
  }],

  // Notes
  notes: String
}, {
  timestamps: true
});

// Compound indexes
availabilitySchema.index({ teacher: 1, dayOfWeek: 1 });
availabilitySchema.index({ teacher: 1, specificDate: 1 });
availabilitySchema.index({ teacher: 1, isActive: 1 });

// Virtual for day name
availabilitySchema.virtual('dayName').get(function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[this.dayOfWeek];
});

// Check if a time slot is available
availabilitySchema.methods.isSlotAvailable = function(startTime, endTime) {
  return this.timeSlots.some(slot =>
    slot.startTime === startTime &&
    slot.endTime === endTime &&
    !slot.isBooked
  );
};

// Book a time slot
availabilitySchema.methods.bookSlot = async function(startTime, endTime, userId, sessionId) {
  const slot = this.timeSlots.find(s =>
    s.startTime === startTime && s.endTime === endTime && !s.isBooked
  );

  if (!slot) {
    throw new Error('Time slot not available');
  }

  slot.isBooked = true;
  slot.bookedBy = userId;
  slot.session = sessionId;

  return this.save();
};

// Release a booked slot (on cancellation)
availabilitySchema.methods.releaseSlot = async function(sessionId) {
  const slot = this.timeSlots.find(s => s.session && s.session.toString() === sessionId.toString());

  if (slot) {
    slot.isBooked = false;
    slot.bookedBy = null;
    slot.session = null;
    return this.save();
  }

  return this;
};

// Static method to get teacher's availability for a date
availabilitySchema.statics.getAvailabilityForDate = async function(teacherId, date) {
  const dayOfWeek = date.getDay();
  const dateString = date.toISOString().split('T')[0];

  // Check for specific date availability first
  let availability = await this.findOne({
    teacher: teacherId,
    specificDate: {
      $gte: new Date(dateString),
      $lt: new Date(new Date(dateString).getTime() + 24 * 60 * 60 * 1000)
    },
    isActive: true
  });

  // If no specific date, check recurring availability
  if (!availability) {
    availability = await this.findOne({
      teacher: teacherId,
      dayOfWeek,
      isRecurring: true,
      isActive: true,
      $or: [
        { validFrom: { $exists: false } },
        { validFrom: { $lte: date } }
      ],
      $and: [
        {
          $or: [
            { validUntil: { $exists: false } },
            { validUntil: { $gte: date } }
          ]
        }
      ]
    });
  }

  return availability;
};

// Static method to get teacher's weekly availability
availabilitySchema.statics.getWeeklyAvailability = function(teacherId) {
  return this.find({
    teacher: teacherId,
    isRecurring: true,
    isActive: true
  }).sort({ dayOfWeek: 1 });
};

// Static method to generate default weekly availability template
availabilitySchema.statics.createDefaultAvailability = async function(teacherId, timezone = 'UTC') {
  const defaultSchedule = [
    { day: 1, start: '09:00', end: '17:00' }, // Monday
    { day: 2, start: '09:00', end: '17:00' }, // Tuesday
    { day: 3, start: '09:00', end: '17:00' }, // Wednesday
    { day: 4, start: '09:00', end: '17:00' }, // Thursday
    { day: 5, start: '09:00', end: '17:00' }  // Friday
  ];

  const availabilities = defaultSchedule.map(schedule => ({
    teacher: teacherId,
    dayOfWeek: schedule.day,
    timezone,
    isRecurring: true,
    isActive: true,
    timeSlots: generateTimeSlots(schedule.start, schedule.end)
  }));

  return this.insertMany(availabilities);
};

// Helper function to generate hourly time slots
function generateTimeSlots(startTime, endTime) {
  const slots = [];
  let [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

    // Add 1 hour
    currentMin += 60;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }

    const slotEnd = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

    if (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        isBooked: false
      });
    }
  }

  return slots;
}

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;
