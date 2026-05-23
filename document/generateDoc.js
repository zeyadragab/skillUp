import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";
import fs from "fs";

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: "skillup Platform",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "Complete Feature Documentation",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // Project Overview
        new Paragraph({
          text: "Project Overview",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Project Name: ", bold: true }),
            new TextRun("skillup"),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Description: ", bold: true }),
            new TextRun(
              "A peer-to-peer skill exchange platform where users can teach and learn skills using a token-based economy.",
            ),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Technology Stack: ", bold: true }),
            new TextRun(
              "React.js, Node.js, Express.js, MongoDB, Socket.io, TailwindCSS",
            ),
          ],
          spacing: { after: 300 },
        }),

        // Section 1: Authentication
        new Paragraph({
          text: "1. Authentication & User Management",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          text: "1.1 Email/Password Authentication",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• User Registration: ", bold: true }),
            new TextRun(
              "Sign up with name, email, password, and role selection (learner/teacher/both)",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• User Login: ", bold: true }),
            new TextRun("Traditional email and password authentication"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Email Activation: ", bold: true }),
            new TextRun(
              "Account activation via secure email link (required before first login)",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Resend Activation Email: ", bold: true }),
            new TextRun("Request new activation link if the original expired"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "1.2 OTP (One-Time Password) Login",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Request OTP: ", bold: true }),
            new TextRun("Send 6-digit verification code to registered email"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Verify OTP: ", bold: true }),
            new TextRun("Passwordless login using email verification code"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Security Features: ", bold: true }),
            new TextRun(
              "10-minute OTP expiry, maximum 5 verification attempts",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Brute Force Protection: ", bold: true }),
            new TextRun("Rate limiting on OTP requests"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "1.3 Password Management",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Forgot Password: ", bold: true }),
            new TextRun("Request password reset via email"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Reset Password: ", bold: true }),
            new TextRun("Set new password using secure reset link"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "1.4 Profile Management",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• View Profile: ", bold: true }),
            new TextRun("Display user details, skills, and statistics"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Update Profile: ", bold: true }),
            new TextRun(
              "Edit name, bio, country, timezone, languages, and avatar",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• User Preferences: ", bold: true }),
            new TextRun(
              "Customize notification settings and theme preferences",
            ),
          ],
          spacing: { after: 300 },
        }),

        // Section 2: Skills System
        new Paragraph({
          text: "2. Skills System",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          text: "2.1 Skill Management",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Browse Skills: ", bold: true }),
            new TextRun("View all available skills organized by categories"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Search Skills: ", bold: true }),
            new TextRun("Find specific skills using keyword search"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Skill Categories: ", bold: true }),
            new TextRun(
              "Technology, Languages, Arts & Crafts, Business, Music, Sports, Academics, Lifestyle",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Add Skills to Teach: ", bold: true }),
            new TextRun("Teachers can list skills they want to offer"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Add Skills to Learn: ", bold: true }),
            new TextRun("Learners can list skills they want to acquire"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "2.2 Skill Discovery",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Find Teachers by Skill: ", bold: true }),
            new TextRun("Search for users who teach specific skills"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Skill Proficiency Levels: ", bold: true }),
            new TextRun("Beginner, Intermediate, Advanced, Expert"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Hourly Token Rates: ", bold: true }),
            new TextRun("Teachers set their rates per hour of instruction"),
          ],
          spacing: { after: 300 },
        }),

        // Section 3: Token Economy
        new Paragraph({
          text: "3. Token Economy System",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          text: "3.1 Token Management",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Welcome Bonus: ", bold: true }),
            new TextRun("50 free tokens awarded upon registration"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Token Balance: ", bold: true }),
            new TextRun("Real-time tracking of current token balance"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Tokens Earned: ", bold: true }),
            new TextRun("Accumulated from teaching sessions"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Tokens Spent: ", bold: true }),
            new TextRun("Deducted for learning sessions"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "3.2 Transaction System",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Transaction History: ", bold: true }),
            new TextRun("Complete log of all token movements"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Transaction Types: ", bold: true }),
            new TextRun("Credit and Debit entries with detailed reasons"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Balance Tracking: ", bold: true }),
            new TextRun(
              "Before and after balance recorded for each transaction",
            ),
          ],
          spacing: { after: 300 },
        }),

        // Section 4: User Discovery
        new Paragraph({
          text: "4. User Discovery & Social Features",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          text: "4.1 Search & Browse",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Search Users: ", bold: true }),
            new TextRun("Find users by name or keyword"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Browse Teachers: ", bold: true }),
            new TextRun("View complete list of available teachers"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Filter by Skill: ", bold: true }),
            new TextRun("Find users teaching specific skills"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• User Profiles: ", bold: true }),
            new TextRun("Detailed teacher and learner profile pages"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "4.2 Social Interaction",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Follow Users: ", bold: true }),
            new TextRun("Follow favorite teachers and learners"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Followers/Following Lists: ", bold: true }),
            new TextRun("View and manage social connections"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• User Ratings: ", bold: true }),
            new TextRun("Average rating and total review count display"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Teacher Statistics: ", bold: true }),
            new TextRun("Sessions taught, experience level, and achievements"),
          ],
          spacing: { after: 300 },
        }),

        // Section 5: Messaging
        new Paragraph({
          text: "5. Real-Time Messaging System",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          text: "5.1 Chat Features",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Direct Messages: ", bold: true }),
            new TextRun("Send private messages to any user"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Conversations List: ", bold: true }),
            new TextRun("View all active conversations"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Real-Time Updates: ", bold: true }),
            new TextRun("Instant message delivery using Socket.io"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Message History: ", bold: true }),
            new TextRun("Access and scroll through previous messages"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Read Receipts: ", bold: true }),
            new TextRun("Track message read status"),
          ],
          spacing: { after: 300 },
        }),

        // Section 6: Session Booking
        new Paragraph({
          text: "6. Session Booking System",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Book Sessions: ", bold: true }),
            new TextRun("Schedule learning sessions with teachers"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Session Status Tracking: ", bold: true }),
            new TextRun("Pending, Confirmed, Completed, Cancelled states"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Token Transfer: ", bold: true }),
            new TextRun("Automatic token exchange upon session completion"),
          ],
          spacing: { after: 300 },
        }),

        // Section 7: Gamification
        new Paragraph({
          text: "7. Gamification Features",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          text: "7.1 Streak System",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Daily Streak: ", bold: true }),
            new TextRun("Track consecutive days of platform activity"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Current Streak Counter: ", bold: true }),
            new TextRun("Display ongoing streak count"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Longest Streak Record: ", bold: true }),
            new TextRun("Personal best streak achievement"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Last Activity Tracking: ", bold: true }),
            new TextRun("Monitor user engagement"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "7.2 Leveling System",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• User Levels: ", bold: true }),
            new TextRun("Progressive levels based on experience points"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Experience Points: ", bold: true }),
            new TextRun("Earned through various platform activities"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Achievement Badges: ", bold: true }),
            new TextRun("Special badges for milestones and accomplishments"),
          ],
          spacing: { after: 300 },
        }),

        // Section 8: Admin
        new Paragraph({
          text: "8. Admin Features",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• User Management: ", bold: true }),
            new TextRun("View, edit, and manage all platform users"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Role Management: ", bold: true }),
            new TextRun("Assign and modify user roles (User, Teacher, Admin)"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Platform Statistics: ", bold: true }),
            new TextRun("Overview of platform metrics and activity"),
          ],
          spacing: { after: 300 },
        }),

        // Section 9: Security
        new Paragraph({
          text: "9. Security Features",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          text: "9.1 Rate Limiting",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Authentication Rate Limit: ", bold: true }),
            new TextRun("5 attempts per 15 minutes for login/register"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• OTP Rate Limit: ", bold: true }),
            new TextRun("3 OTP requests per 15 minutes"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• General API Rate Limit: ", bold: true }),
            new TextRun("100 requests per 15 minutes"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "9.2 Input Validation & Authentication",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Email Validation: ", bold: true }),
            new TextRun("Proper email format verification"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Password Strength: ", bold: true }),
            new TextRun("Minimum security requirements enforced"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Data Sanitization: ", bold: true }),
            new TextRun("XSS and SQL injection protection"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• JWT Tokens: ", bold: true }),
            new TextRun("Secure JSON Web Tokens with 7-day expiry"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Protected Routes: ", bold: true }),
            new TextRun("Authentication required for sensitive endpoints"),
          ],
          spacing: { after: 300 },
        }),

        // Section 10: Frontend Pages Table
        new Paragraph({
          text: "10. Frontend Pages",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Page Name", bold: true }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { fill: "E0E0E0" },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Description", bold: true }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  shading: { fill: "E0E0E0" },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Landing Page")] }),
                new TableCell({
                  children: [new Paragraph("Welcome page for new visitors")],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Sign Up")] }),
                new TableCell({
                  children: [new Paragraph("User registration form")],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Sign In")] }),
                new TableCell({ children: [new Paragraph("User login form")] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Dashboard")] }),
                new TableCell({
                  children: [
                    new Paragraph("User home page after authentication"),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Home")] }),
                new TableCell({
                  children: [new Paragraph("Main browsing and discovery page")],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Profile")] }),
                new TableCell({
                  children: [new Paragraph("User profile view and edit page")],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Teacher Profile")] }),
                new TableCell({
                  children: [
                    new Paragraph("Detailed teacher information page"),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Skill Search Results")],
                }),
                new TableCell({
                  children: [new Paragraph("Search results display page")],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Activate Account")],
                }),
                new TableCell({
                  children: [
                    new Paragraph("Email activation confirmation page"),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("OTP Login")] }),
                new TableCell({
                  children: [new Paragraph("OTP request page")],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("OTP Verify")] }),
                new TableCell({
                  children: [new Paragraph("OTP code entry page")],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Admin Dashboard")] }),
                new TableCell({
                  children: [new Paragraph("Administrative control panel")],
                }),
              ],
            }),
          ],
        }),

        // Section 11: Technical Architecture
        new Paragraph({
          text: "11. Technical Architecture",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          text: "11.1 Backend Stack",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Runtime: ", bold: true }),
            new TextRun("Node.js"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Framework: ", bold: true }),
            new TextRun("Express.js"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Database: ", bold: true }),
            new TextRun("MongoDB with Mongoose ODM"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Real-Time: ", bold: true }),
            new TextRun("Socket.io for WebSocket connections"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Email Service: ", bold: true }),
            new TextRun("Nodemailer with Gmail SMTP"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "11.2 Frontend Stack",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Framework: ", bold: true }),
            new TextRun("React.js"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Build Tool: ", bold: true }),
            new TextRun("Vite"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Styling: ", bold: true }),
            new TextRun("TailwindCSS"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• State Management: ", bold: true }),
            new TextRun("React Context API"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• HTTP Client: ", bold: true }),
            new TextRun("Axios"),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "11.3 Security Implementation",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Password Hashing: ", bold: true }),
            new TextRun("Bcrypt.js"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Authentication: ", bold: true }),
            new TextRun("JSON Web Tokens (JWT)"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• CORS: ", bold: true }),
            new TextRun("Cross-Origin Resource Sharing configuration"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Helmet: ", bold: true }),
            new TextRun("HTTP security headers"),
          ],
          spacing: { after: 400 },
        }),

        // Footer
        new Paragraph({
          children: [
            new TextRun({ text: "Document Information", bold: true, size: 24 }),
          ],
          spacing: { before: 400, after: 100 },
        }),
        new Paragraph({ text: "Created: November 2024" }),
        new Paragraph({ text: "Version: 1.0" }),
        new Paragraph({ text: "Platform Status: Development" }),
      ],
    },
  ],
});

// Generate and save the document
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("skillup_Features.docx", buffer);
  console.log("✅ Word document created: skillup_Features.docx");
});
