import mongoose from 'mongoose';

// Main app connection — reads/writes users, sessions, skills, transactions, payments
export const mainConn = mongoose.createConnection();

// Admin-only connection — reads/writes admins, activity logs, reports, system settings
export const adminConn = mongoose.createConnection();

const connectDB = async () => {
  try {
    await mainConn.openUri(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ Main DB Connected: ${mainConn.host}`);
  } catch (error) {
    console.error(`❌ Main DB Connection Error: ${error.message}`);
    process.exit(1);
  }

  try {
    const adminUri = process.env.ADMIN_DB_URI || process.env.MONGODB_URI;
    await adminConn.openUri(adminUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ Admin DB Connected: ${adminConn.host}`);
  } catch (error) {
    console.error(`❌ Admin DB Connection Error: ${error.message}`);
    process.exit(1);
  }

  mainConn.on('disconnected', () => console.log('⚠️  Main DB disconnected'));
  mainConn.on('error', (err) => console.error('❌ Main DB error:', err));
  adminConn.on('disconnected', () => console.log('⚠️  Admin DB disconnected'));
  adminConn.on('error', (err) => console.error('❌ Admin DB error:', err));
};

export default connectDB;
