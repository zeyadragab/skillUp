import mongoose from "mongoose";
import dotenv from "dotenv";
import Session from "../src/models/Session.js";
import User from "../src/models/User.js";

dotenv.config();

async function createAhmedSession() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/skillup",
    );
    console.log("✅ Connected to MongoDB");

    const userEmail = "ahmed.youssef@example.com";
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`);
      console.log("Available users:");
      const users = await User.find({}).select("name email isTeacher");
      users.forEach((u) =>
        console.log(`  - ${u.name} (${u.email}) - Teacher: ${u.isTeacher}`),
      );
      process.exit(1);
    }

    console.log(
      `✅ Found user: ${user.name} (${user.email}) - Teacher: ${user.isTeacher}`,
    );

    let otherUser;
    if (user.isTeacher) {
      otherUser = await User.findOne({
        _id: { $ne: user._id },
        isTeacher: false,
      });
    } else {
      otherUser = await User.findOne({
        _id: { $ne: user._id },
        isTeacher: true,
        "skillsToTeach.0": { $exists: true },
      });
    }

    if (!otherUser) {
      otherUser = await User.findOne({ _id: { $ne: user._id } });
    }

    if (!otherUser) {
      console.log("❌ No other user found in the database");
      process.exit(1);
    }

    const teacher = user.isTeacher ? user : otherUser;
    const learner = user.isTeacher ? otherUser : user;

    const teachingSkill = teacher.skillsToTeach?.[0];
    const skillName = teachingSkill?.name || "UI/UX Design";
    const skillCategory = teachingSkill?.category || "Design";

    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now

    const agoraChannel = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const session = await Session.create({
      teacher: teacher._id,
      learner: learner._id,
      skill: skillName,
      skillCategory,
      title: `Live Session: ${skillName}`,
      description: `Test session for ${userEmail}`,
      scheduledAt: scheduledTime,
      duration: 60,
      sessionType: "one-on-one",
      isSkillExchange: false,
      tokensCharged: 0,
      status: "scheduled",
      agoraChannel,
    });

    console.log("\n🎉 Session created successfully!");
    console.log("📋 Session Details:");
    console.log(`   ID:            ${session._id}`);
    console.log(`   Teacher:       ${teacher.name} (${teacher.email})`);
    console.log(`   Learner:       ${learner.name} (${learner.email})`);
    console.log(`   Skill:         ${skillName}`);
    console.log(`   Status:        ${session.status}`);
    console.log(`   Scheduled At:  ${scheduledTime.toLocaleString()}`);
    console.log(`   Duration:      ${session.duration} minutes`);
    console.log(`   Agora Channel: ${agoraChannel}`);
    console.log("\n✨ To test:");
    console.log(`1. Login as: ${userEmail}`);
    console.log("2. Go to Sessions page: http://localhost:5173/sessions");
    console.log('3. Find the session and click "Join"');

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAhmedSession();
