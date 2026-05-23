# ERD+ Import Instructions

This guide explains how to import the skillup ERD into ERD+ or similar ERD tools.

## Files Provided

1. **ERD_DOCUMENTATION.md** - Complete documentation of all entities, attributes, and relationships
2. **ERD_PLUS_FORMAT.sql** - SQL DDL format (compatible with ERD+ and most ERD tools)
3. **ERD_PLUS_JSON.json** - JSON format describing the ERD structure

## How to Import into ERD+

### Option 1: Import SQL DDL (Recommended)

1. Go to [ERD+ Website](https://erdplus.com/)
2. Sign up or log in
3. Click "New Diagram" or "Import"
4. Select "Import SQL" or "Import DDL"
5. Copy and paste the contents of `ERD_PLUS_FORMAT.sql`
6. Click "Import" or "Generate"
7. The ERD will be automatically generated with all entities and relationships

### Option 2: Manual Creation from Documentation

If automatic import doesn't work, you can manually create the ERD using `ERD_DOCUMENTATION.md`:

1. Open ERD+ website
2. Create a new diagram
3. For each entity listed in the documentation:
   - Add a new table/entity
   - Add all attributes with their types and constraints
   - Mark primary keys
4. Create relationships between entities as specified in the "Relationship Summary" section

### Option 3: Using Other ERD Tools

#### dbdiagram.io

1. Go to [dbdiagram.io](https://dbdiagram.io/)
2. Create a new project
3. Copy the SQL DDL from `ERD_PLUS_FORMAT.sql`
4. Paste into the editor (it accepts MySQL-style DDL)
5. The diagram will be auto-generated

#### Draw.io / diagrams.net

1. Go to [draw.io](https://app.diagrams.net/)
2. Create a new diagram
3. Use the documentation to manually create entities and relationships
4. Use the Entity Relationship shapes from the shapes library

#### Lucidchart

1. Go to [Lucidchart](https://www.lucidchart.com/)
2. Create a new Entity Relationship Diagram
3. Import the SQL DDL or manually create from documentation

## Key Relationships to Visualize

### Core Relationships:

1. **Users → Sessions** (Teacher: 1:N)
2. **Users → Sessions** (Learner: 1:N)
3. **Sessions → Recordings** (1:1)
4. **Sessions → SessionSummaries** (1:1)
5. **Users → Transactions** (1:N)
6. **Users → Payments** (1:N)
7. **Payments → Transactions** (1:N)
8. **Users ↔ Conversations** (M:N via participants)
9. **Conversations → Messages** (1:N)
10. **Users → Notifications** (1:N)
11. **Users → Availabilities** (1:N)
12. **Users ↔ Users** (M:N via followers/following)

### Admin Relationships:

1. **Admins → ActivityLogs** (1:N)
2. **Admins → Reports** (1:N)
3. **Admins → SystemNotifications** (1:N)
4. **Admins → SystemSettings** (1:N)
5. **Users → Reports** (1:N)

## Entity Groups for Better Organization

### Core User System

- Users
- OTPs
- ActivationTokens

### Session Management

- Sessions
- Recordings
- SessionSummaries
- Availabilities

### Financial System

- Transactions
- Payments

### Communication

- Conversations
- Messages
- Notifications

### Skills & Content

- Skills

### Administration

- Admins
- ActivityLogs
- Reports
- SystemNotifications
- SystemSettings

## Tips for ERD+ Editing

1. **Color Coding**: Use different colors for different entity groups
2. **Cardinality**: Ensure all relationships show correct cardinality (1:1, 1:N, M:N)
3. **Foreign Keys**: Mark foreign key relationships clearly
4. **Indexes**: Optionally show indexes on frequently queried fields
5. **Notes**: Add notes explaining complex relationships
6. **Grouping**: Group related entities visually

## Verification Checklist

After importing, verify:

- [ ] All 18 entities are present
- [ ] Primary keys are marked on all entities
- [ ] Foreign keys are properly connected
- [ ] Relationship cardinalities are correct
- [ ] All attributes are included
- [ ] Enum values are documented
- [ ] Required fields are marked
- [ ] Unique constraints are indicated

## Common Issues and Solutions

### Issue: SQL import fails

**Solution**: Try removing MongoDB-specific syntax or use the JSON format

### Issue: Relationships not showing

**Solution**: Manually create relationships using the documentation

### Issue: Attributes missing

**Solution**: Refer to `ERD_DOCUMENTATION.md` for complete attribute lists

### Issue: Complex nested objects not importing

**Solution**: Flatten nested objects in SQL format or create separate tables for sub-documents

## Additional Resources

- ERD+ Documentation: Check ERD+ website for latest import formats
- MongoDB to SQL: The SQL DDL is a conceptual representation - actual MongoDB schemas may differ slightly
- Entity Documentation: Refer to model files in `backend/src/models/` for exact MongoDB schemas

## Export and Sharing

Once created in ERD+:

1. Export as PNG/PDF for documentation
2. Export as SQL if needed for database migrations
3. Share the ERD+ link with your team for collaborative editing
4. Keep the ERD updated as the schema evolves

---

**Note**: Since this is a MongoDB application, the SQL DDL is a conceptual representation. The actual MongoDB schemas use embedded documents and arrays which are represented here as separate tables or JSON columns in the SQL format.
