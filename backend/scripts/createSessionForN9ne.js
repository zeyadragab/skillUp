import mongoose from "mongoose";
import dotenv from "dotenv";
import Session from "../src/models/Session.js";
import User from "../src/models/User.js";

dotenv.config();

async function createSession() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/skillup",
    );
    console.log("✅ Connected to MongoDB");

    const targetUser = await User.findOne({ email: "n9ne.eg1@gmail.com" });
    if (!targetUser) {
      console.log("❌ User n9ne.eg1@gmail.com not found");
      process.exit(1);
    }

    // Find a teacher to pair with
    const teacher = await User.findOne({
      isTeacher: true,
      "skillsToTeach.0": { $exists: true },
      _id: { $ne: targetUser._id },
    });
    if (!teacher) {
      console.log("❌ No teacher found");
      process.exit(1);
    }

    const isTargetTeacher = targetUser.isTeacher;
    const sessionTeacher = isTargetTeacher ? targetUser : teacher;
    const sessionLearner = isTargetTeacher ? teacher : targetUser;

    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow

    const teachingSkill = sessionTeacher.skillsToTeach?.[0];

    const session = await Session.create({
      teacher: sessionTeacher._id,
      learner: sessionLearner._id,
      skill: teachingSkill?.name || "General Skill",
      skillCategory: teachingSkill?.category || "Education",
      title: `Test Session: ${teachingSkill?.name || "General Skill"}`,
      description: "Test session created for n9ne.eg1@gmail.com",
      scheduledAt: scheduledTime,
      duration: 60,
      sessionType: "one-on-one",
      isSkillExchange: false,
      tokensCharged: 0,
      status: "scheduled",
    });

    console.log("\n🎉 Session created successfully!");
    console.log(`   ID: ${session._id}`);
    console.log(`   Teacher: ${sessionTeacher.name} (${sessionTeacher.email})`);
    console.log(`   Learner: ${sessionLearner.name} (${sessionLearner.email})`);
    console.log(`   Skill: ${session.skill}`);
    console.log(`   Scheduled: ${scheduledTime.toLocaleString()}`);
    console.log(`   Status: ${session.status}`);
    console.log(
      "\n📌 Login as n9ne.eg1@gmail.com and visit /sessions to see it.",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createSession();
