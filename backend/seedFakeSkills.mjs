import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Skill from './src/models/Skill.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const fakeSkills = [
  {
    name: 'Python Programming',
    category: 'Programming & Tech',
    description: 'Learn Python from basics to advanced, including data analysis and web development.',
    icon: '🐍',
    difficulty: 'beginner',
    tags: ['python', 'coding', 'backend', 'data science']
  },
  {
    name: 'React Web Development',
    category: 'Programming & Tech',
    description: 'Build interactive user interfaces using React.js.',
    icon: '⚛️',
    difficulty: 'intermediate',
    tags: ['react', 'frontend', 'javascript', 'web']
  },
  {
    name: 'UI/UX Design',
    category: 'Design & Creative',
    description: 'Master Figma, wireframing, and creating beautiful user experiences.',
    icon: '🎨',
    difficulty: 'beginner',
    tags: ['design', 'ui', 'ux', 'figma']
  },
  {
    name: 'Digital Art',
    category: 'Design & Creative',
    description: 'Create stunning digital illustrations and paintings.',
    icon: '🖌️',
    difficulty: 'intermediate',
    tags: ['art', 'illustration', 'photoshop', 'procreate']
  },
  {
    name: 'Spanish Conversation',
    category: 'Languages',
    description: 'Practice conversational Spanish for travel and business.',
    icon: '🇪🇸',
    difficulty: 'beginner',
    tags: ['spanish', 'language', 'speaking', 'conversation']
  },
  {
    name: 'Arabic for Beginners',
    category: 'Languages',
    description: 'Learn the Arabic alphabet, grammar, and basic conversation.',
    icon: '🇦🇪',
    difficulty: 'beginner',
    tags: ['arabic', 'language', 'grammar']
  },
  {
    name: 'Business Strategy',
    category: 'Business & Finance',
    description: 'Develop comprehensive business strategies for startups and companies.',
    icon: '📈',
    difficulty: 'advanced',
    tags: ['business', 'strategy', 'startup', 'management']
  },
  {
    name: 'Personal Finance',
    category: 'Business & Finance',
    description: 'Learn budgeting, saving, and investing principles.',
    icon: '💰',
    difficulty: 'beginner',
    tags: ['finance', 'money', 'investing', 'budget']
  },
  {
    name: 'Yoga for Beginners',
    category: 'Health & Wellness',
    description: 'Basic yoga poses and breathing techniques for flexibility and peace of mind.',
    icon: '🧘',
    difficulty: 'beginner',
    tags: ['yoga', 'health', 'fitness', 'meditation']
  },
  {
    name: 'Acoustic Guitar',
    category: 'Music & Arts',
    description: 'Learn chords, strumming patterns, and your favorite songs on the guitar.',
    icon: '🎸',
    difficulty: 'beginner',
    tags: ['music', 'guitar', 'instrument', 'playing']
  },
  {
    name: 'Italian Cooking',
    category: 'Cooking & Culinary',
    description: 'Master authentic Italian pasta, pizza, and sauces from scratch.',
    icon: '🍝',
    difficulty: 'intermediate',
    tags: ['cooking', 'food', 'italian', 'baking']
  },
  {
    name: 'Video Editing with Premiere',
    category: 'Photography & Video',
    description: 'Edit professional videos, add transitions, and color grade clips.',
    icon: '🎬',
    difficulty: 'intermediate',
    tags: ['video', 'editing', 'premiere', 'youtube']
  },
  {
    name: 'Digital Marketing / SEO',
    category: 'Marketing & Sales',
    description: 'Learn search engine optimization to rank websites higher on Google.',
    icon: '🔍',
    difficulty: 'intermediate',
    tags: ['seo', 'marketing', 'google', 'traffic']
  },
  {
    name: 'Data Science with Pandas',
    category: 'Science & Math',
    description: 'Analyze large datasets using Python and the Pandas library.',
    icon: '📊',
    difficulty: 'advanced',
    tags: ['data', 'science', 'math', 'pandas', 'python']
  }
];

async function seedSkills() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is undefined. Check your .env file.');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    let createdSkills = 0;
    for (const skillData of fakeSkills) {
      const existingSkill = await Skill.findOne({ name: skillData.name });
      if (!existingSkill) {
        const newSkill = new Skill(skillData);
        await newSkill.save();
        createdSkills++;
        console.log(`Created skill: ${skillData.name}`);
      } else {
        console.log(`Skill "${skillData.name}" already exists. Skipping.`);
      }
    }
    
    console.log(`\nSuccessfully created ${createdSkills} skills!`);
    
  } catch (error) {
    console.error('Error seeding skills:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedSkills();
