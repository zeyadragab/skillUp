# How to Seed Skills Database

## Step 1: Fix MongoDB Connection

1. Go to https://cloud.mongodb.com/
2. Sign in with your credentials
3. Click on **"Network Access"** in the left sidebar
4. Click **"Add IP Address"**
5. Click **"ALLOW ACCESS FROM ANYWHERE"** (adds 0.0.0.0/0)
6. Click **"Confirm"**
7. Wait 1-2 minutes for changes to take effect

## Step 2: Verify Backend is Connected

Wait until you see this in the backend terminal:

```
✅ MongoDB connected successfully
🚀 skillup Server is running!
```

## Step 3: Run Seed Command

Open a **NEW terminal** (don't close the running backend server) and run:

```bash
cd "c:\Users\Boyka\Zeyad Ragab\swaply final proj\swaply\backend"
npm run seed
```

This will:

- Clear existing skills
- Add 75+ skills across 13 categories
- Display a summary of added skills

## Step 4: Verify

After seeding, you should see:

```
✅ Successfully seeded 75 skills!

Skills by category:
   Programming & Tech: 10 skills
   Design & Creative: 7 skills
   Languages: 7 skills
   Business & Finance: 7 skills
   Health & Wellness: 5 skills
   Music & Arts: 6 skills
   Cooking & Culinary: 5 skills
   Sports & Fitness: 4 skills
   Photography & Video: 4 skills
   Writing & Content: 4 skills
   Marketing & Sales: 3 skills
   Science & Math: 5 skills
```

## Step 5: Test in Frontend

1. Go to your Profile page
2. Click "Add Skill" button
3. You should now see all 75+ skills
4. Try searching (e.g., "JavaScript", "React", "Python")
5. Try filtering by category (e.g., "Programming & Tech")

## Available Skills Categories:

1. **Programming & Tech**: JavaScript, React, Node.js, Python, TypeScript, MongoDB, SQL, Git & GitHub, Docker, AWS
2. **Design & Creative**: UI/UX Design, Figma, Photoshop, Illustrator, Graphic Design, Video Editing, Animation
3. **Languages**: English, Spanish, French, German, Mandarin Chinese, Japanese, Arabic
4. **Business & Finance**: Digital Marketing, SEO, Social Media Marketing, Accounting, Stock Trading, Project Management, Excel
5. **Health & Wellness**: Yoga, Meditation, Nutrition, Personal Training, Mental Health
6. **Music & Arts**: Guitar, Piano, Singing, Music Production, Drawing, Painting
7. **Cooking & Culinary**: Cooking Basics, Baking, Italian Cuisine, Asian Cuisine, Vegan Cooking
8. **Sports & Fitness**: Running, Swimming, Boxing, CrossFit
9. **Photography & Video**: Photography Basics, Portrait Photography, Landscape Photography, Videography
10. **Writing & Content**: Creative Writing, Content Writing, Copywriting, Technical Writing
11. **Marketing & Sales**: Email Marketing, Sales Skills, Content Marketing
12. **Science & Math**: Mathematics, Physics, Chemistry, Biology, Data Science
