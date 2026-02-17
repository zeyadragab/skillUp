import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Availability from '../src/models/Availability.js';

dotenv.config();

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

async function addDefaultAvailability() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap');
    console.log('✅ Connected to MongoDB');

    // Find all teachers who have teaching skills
    const teachers = await User.find({
      isTeacher: true,
      $or: [
        { 'skillsToTeach.0': { $exists: true } },
        { skillsToTeach: { $ne: [] } }
      ]
    });

    console.log(`📚 Found ${teachers.length} teachers with teaching skills`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const teacher of teachers) {
      // Check if teacher already has availability
      const existingAvailability = await Availability.find({ teacher: teacher._id });

      if (existingAvailability.length > 0) {
        console.log(`⏭️  Skipping ${teacher.name} - already has availability`);
        skippedCount++;
        continue;
      }

      // Create default availability for Monday-Friday (9 AM - 5 PM)
      const defaultSchedule = [
        { day: 1, start: '09:00', end: '17:00' }, // Monday
        { day: 2, start: '09:00', end: '17:00' }, // Tuesday
        { day: 3, start: '09:00', end: '17:00' }, // Wednesday
        { day: 4, start: '09:00', end: '17:00' }, // Thursday
        { day: 5, start: '09:00', end: '17:00' }  // Friday
      ];

      const availabilities = defaultSchedule.map(schedule => ({
        teacher: teacher._id,
        dayOfWeek: schedule.day,
        timezone: 'UTC',
        isRecurring: true,
        isActive: true,
        timeSlots: generateTimeSlots(schedule.start, schedule.end)
      }));

      await Availability.insertMany(availabilities);
      console.log(`✅ Added availability for ${teacher.name} (${teacher.email})`);
      addedCount++;
    }

    console.log('\n🎉 Script completed!');
    console.log(`✅ Added availability for ${addedCount} teachers`);
    console.log(`⏭️  Skipped ${skippedCount} teachers (already have availability)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addDefaultAvailability();
