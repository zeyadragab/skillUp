# skillup Platform - Enhanced ERD Files

This directory contains comprehensive Entity Relationship Diagram (ERD) files for the skillup platform that can be imported into ERD+ or similar tools.

## 📁 Files Overview

### 1. ERD_DOCUMENTATION.md

Complete documentation of all database entities, attributes, relationships, and indexes. This is the most detailed reference document.

**Contains:**

- All 18 entities with full attribute descriptions
- Data types, constraints, and default values
- Relationship definitions with cardinality
- Index information
- Notes and best practices

### 2. ERD_PLUS_FORMAT.sql

SQL DDL format compatible with ERD+ and most ERD tools. This is the file you'll most likely import.

**Format:** Standard SQL DDL (MySQL/PostgreSQL style)
**Usage:** Copy and paste into ERD+ import function

### 3. ERD_PLUS_JSON.json

JSON format describing the ERD structure. Useful for programmatic access or tools that accept JSON.

**Format:** Structured JSON with entities and relationships
**Usage:** Some tools may accept JSON imports

### 4. ERD_IMPORT_INSTRUCTIONS.md

Step-by-step guide on how to import the ERD into various tools.

**Contains:**

- Import instructions for ERD+
- Alternative tools (dbdiagram.io, Draw.io, Lucidchart)
- Verification checklist
- Troubleshooting tips

### 5. ERD_README.md (this file)

Overview and quick start guide.

## 🚀 Quick Start

### To Import into ERD+:

1. Go to [erdplus.com](https://erdplus.com/)
2. Sign up/Login
3. Click "New Diagram" → "Import SQL"
4. Open `ERD_PLUS_FORMAT.sql`
5. Copy entire contents
6. Paste into ERD+ import dialog
7. Click "Import"
8. ✨ Your ERD is ready to edit!

## 📊 Database Overview

### Total Entities: 18

#### Core Entities (13):

1. **Users** - Main user accounts (learners and teachers)
2. **Skills** - Available skills/courses
3. **Sessions** - Learning sessions
4. **Transactions** - Token transactions
5. **Payments** - Payment records
6. **Conversations** - Chat conversations
7. **Messages** - Chat messages
8. **Notifications** - User notifications
9. **Recordings** - Session video recordings
10. **Availabilities** - Teacher availability schedules
11. **SessionSummaries** - AI-generated session summaries
12. **OTPs** - One-time passwords
13. **ActivationTokens** - Email activation tokens

#### Admin Entities (5):

14. **Admins** - Admin user accounts
15. **ActivityLogs** - Admin activity audit logs
16. **Reports** - User reports for moderation
17. **SystemNotifications** - System-wide notifications
18. **SystemSettings** - Platform configuration

## 🔗 Key Relationships

- **Users ↔ Sessions**: Users can teach and learn in multiple sessions
- **Sessions → Recordings**: Each session can have one recording
- **Sessions → SessionSummaries**: Each session can have one AI summary
- **Users → Transactions**: Users can have multiple token transactions
- **Users → Payments**: Users can make multiple payments
- **Users ↔ Conversations**: Many-to-many relationship via participants
- **Conversations → Messages**: One-to-many relationship
- **Users → Notifications**: Users receive multiple notifications
- **Users ↔ Users**: Follow/follower relationship (many-to-many)

## 📝 Notes

- **Database Type**: MongoDB (NoSQL)
- **ORM**: Mongoose
- **SQL Format**: The SQL DDL files are conceptual representations for ERD tools
- **Actual Schema**: Refer to model files in `backend/src/models/` for exact MongoDB schemas
- **Nested Objects**: Some MongoDB embedded documents are represented as separate tables in SQL format

## 🔄 Keeping ERD Updated

When you make changes to the database schema:

1. Update the model files in `backend/src/models/`
2. Update `ERD_DOCUMENTATION.md`
3. Update `ERD_PLUS_FORMAT.sql`
4. Re-import into ERD+ or your ERD tool
5. Export updated diagrams

## 🛠️ Tools Compatibility

These files are compatible with:

- ✅ **ERD+** (erdplus.com) - Primary target
- ✅ **dbdiagram.io** - Accepts SQL DDL
- ✅ **Draw.io/diagrams.net** - Manual import from documentation
- ✅ **Lucidchart** - SQL DDL import
- ✅ **MySQL Workbench** - Can import SQL DDL
- ✅ **pgAdmin** - Can import SQL DDL (with modifications)

## 📚 Additional Resources

- Backend Models: `backend/src/models/`
- Admin Models: `admin-backend/src/models/`
- Complete Documentation: `COMPLETE_DOCUMENTATION.md`
- Project Structure: `PROJECT_STRUCTURE.md`

## 🤝 Contributing

When adding new entities or relationships:

1. Add to model files first
2. Update `ERD_DOCUMENTATION.md`
3. Update `ERD_PLUS_FORMAT.sql`
4. Update `ERD_PLUS_JSON.json`
5. Update this README if needed
6. Re-import to ERD+ and verify

## 📞 Support

If you encounter issues importing:

1. Check `ERD_IMPORT_INSTRUCTIONS.md` for troubleshooting
2. Verify SQL syntax compatibility with your tool
3. Try importing from `ERD_DOCUMENTATION.md` manually
4. Check tool-specific documentation for import formats

---

**Last Updated:** Based on latest model files review
**Version:** 1.0
**Maintained By:** Development Team
