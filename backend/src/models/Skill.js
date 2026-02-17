import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Programming & Tech',
      'Design & Creative',
      'Languages',
      'Business & Finance',
      'Health & Wellness',
      'Music & Arts',
      'Cooking & Culinary',
      'Sports & Fitness',
      'Photography & Video',
      'Writing & Content',
      'Marketing & Sales',
      'Science & Math',
      'Other'
    ]
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    default: '🎯'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Statistics
  totalTeachers: {
    type: Number,
    default: 0
  },
  totalLearners: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  popularityScore: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
skillSchema.index({ name: 'text', description: 'text', tags: 'text' });
skillSchema.index({ category: 1, popularityScore: -1 });

// Method to update popularity score
skillSchema.methods.updatePopularity = function() {
  this.popularityScore = (this.totalTeachers * 2) + this.totalLearners + (this.averageRating * 10);
  return this.save();
};

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
