import cron from 'node-cron';
import Session from '../models/Session.js';
import Notification from '../models/Notification.js';
// import { sendEmail } from '../services/emailService.js'; // TODO: Create generic sendEmail function

/**
 * Session Reminder Job
 * Runs every hour to check for upcoming sessions
 * Sends reminders at 24h and 1h before session start
 */

// Run every hour at minute 0
export const sessionReminderJob = cron.schedule('0 * * * *', async () => {
  console.log('🔔 Running session reminder job...');

  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Find sessions starting in ~24 hours (between 24-25 hours)
    const sessions24h = await Session.find({
      scheduledAt: {
        $gte: in24Hours,
        $lt: in25Hours
      },
      status: 'scheduled',
      remindersSent: false
    }).populate('teacher learner', 'name email preferences');

    // Find sessions starting in ~1 hour (between 1-2 hours)
    const sessions1h = await Session.find({
      scheduledAt: {
        $gte: in1Hour,
        $lt: in2Hours
      },
      status: 'scheduled'
    }).populate('teacher learner', 'name email preferences');

    // Send 24-hour reminders
    for (const session of sessions24h) {
      // Create notifications
      await Notification.createSessionReminderNotifications(session, 24);

      // TODO: Send emails if user has email notifications enabled
      // if (session.teacher.preferences?.emailNotifications && session.teacher.preferences?.sessionReminders) {
      //   await sendEmail({
      //     to: session.teacher.email,
      //     subject: `Session Reminder: ${session.skill} session tomorrow`,
      //     template: 'sessionReminder24h',
      //     data: {
      //       name: session.teacher.name,
      //       skill: session.skill,
      //       date: session.scheduledAt,
      //       learnerName: session.learner.name,
      //       sessionLink: `${process.env.FRONTEND_URL}/sessions/${session._id}`
      //     }
      //   });
      // }

      // if (session.learner.preferences?.emailNotifications && session.learner.preferences?.sessionReminders) {
      //   await sendEmail({
      //     to: session.learner.email,
      //     subject: `Session Reminder: ${session.skill} session tomorrow`,
      //     template: 'sessionReminder24h',
      //     data: {
      //       name: session.learner.name,
      //       skill: session.skill,
      //       date: session.scheduledAt,
      //       teacherName: session.teacher.name,
      //       sessionLink: `${process.env.FRONTEND_URL}/sessions/${session._id}`
      //     }
      //   });
      // }

      session.remindersSent = true;
      await session.save();
    }

    // Send 1-hour reminders
    for (const session of sessions1h) {
      // Create notifications
      await Notification.createSessionReminderNotifications(session, 1);

      // TODO: Send emails
      // if (session.teacher.preferences?.emailNotifications) {
      //   await sendEmail({
      //     to: session.teacher.email,
      //     subject: `Session Starting Soon: ${session.skill} in 1 hour`,
      //     template: 'sessionReminder1h',
      //     data: {
      //       name: session.teacher.name,
      //       skill: session.skill,
      //       date: session.scheduledAt,
      //       learnerName: session.learner.name,
      //       sessionLink: `${process.env.FRONTEND_URL}/sessions/${session._id}`
      //     }
      //   });
      // }

      // if (session.learner.preferences?.emailNotifications) {
      //   await sendEmail({
      //     to: session.learner.email,
      //     subject: `Session Starting Soon: ${session.skill} in 1 hour`,
      //     template: 'sessionReminder1h',
      //     data: {
      //       name: session.learner.name,
      //       skill: session.skill,
      //       date: session.scheduledAt,
      //       teacherName: session.teacher.name,
      //       sessionLink: `${process.env.FRONTEND_URL}/sessions/${session._id}`
      //     }
      //   });
      // }
    }

    console.log(`✅ Sent ${sessions24h.length} 24-hour reminders and ${sessions1h.length} 1-hour reminders`);
  } catch (error) {
    console.error('❌ Session reminder job error:', error);
  }
}, {
  scheduled: false // Don't start automatically
});

// Start the job
export const startSessionReminderJob = () => {
  sessionReminderJob.start();
  console.log('📅 Session reminder job started');
};

// Stop the job
export const stopSessionReminderJob = () => {
  sessionReminderJob.stop();
  console.log('📅 Session reminder job stopped');
};

export default {
  sessionReminderJob,
  startSessionReminderJob,
  stopSessionReminderJob
};
