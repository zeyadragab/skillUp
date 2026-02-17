# Animation Features Documentation

## Overview
The SkillSwap website now includes smooth scroll animations, interactive hover effects, and focus states to enhance user experience.

## New Components

### 1. `AnimatedSection` Component
**Location:** `src/components/common/AnimatedSection.jsx`

Wrapper component that triggers animations when scrolling into view.

**Usage:**
```jsx
<AnimatedSection animation="fadeInUp" delay={0.2}>
  <h2>Your Content</h2>
</AnimatedSection>
```

**Available Animations:**
- `fadeInUp` - Fade in from bottom
- `fadeInDown` - Fade in from top
- `fadeInLeft` - Fade in from left
- `fadeInRight` - Fade in from right
- `scaleIn` - Scale and fade in
- `slideInUp` - Slide up with spring animation

**Props:**
- `animation` - Animation type (default: "fadeInUp")
- `delay` - Animation delay in seconds (default: 0)
- `duration` - Animation duration in seconds (default: 0.6)
- `className` - Additional CSS classes

### 2. `AnimatedCard` Component
**Location:** `src/components/common/AnimatedCard.jsx`

Card wrapper with scroll animations, hover lift effect, and focus states.

**Usage:**
```jsx
<AnimatedCard delay={0.1} focusEffect={true}>
  <div>Your card content</div>
</AnimatedCard>
```

**Features:**
- Animates on scroll into view
- Lifts on hover (-8px)
- Scales down on click (0.98)
- Optional focus ring

**Props:**
- `delay` - Animation delay in seconds
- `focusEffect` - Enable focus ring (default: true)
- `className` - Additional CSS classes

### 3. `useScrollAnimation` Hook
**Location:** `src/hooks/useScrollAnimation.js`

Custom hook for detecting when elements enter viewport.

**Usage:**
```jsx
const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

return (
  <div ref={ref}>
    {isVisible && <p>Now visible!</p>}
  </div>
);
```

**Options:**
- `threshold` - Percentage of element visible before triggering (0-1)
- `triggerOnce` - Only trigger animation once (default: true)
- `rootMargin` - Margin around viewport for early triggering

## Implemented Animations

### Home Page (`src/pages/Home.jsx`)

#### Hero Section
- **Animated background orbs** - Floating, pulsing gradient circles
- **Staggered text appearance** - Title, subtitle, and buttons fade in sequentially
- **Button interactions** - Scale on hover, press feedback
- **Focus rings** - Accessible keyboard navigation

#### Features Section
- **Card animations** - Each feature card slides up with staggered delays
- **Icon hover effects** - Icons scale and rotate slightly on hover
- **Hover lift** - Cards lift up on hover with shadow enhancement

#### How It Works Section
- **Step number animations** - Numbers rotate 360° on hover
- **Sequential appearance** - Steps appear one by one
- **Card interactions** - Lift and shadow effects

#### Featured Teachers
- **Image zoom on hover** - Teacher photos scale smoothly
- **Rating badge animation** - Star rating appears with spring effect
- **Staggered card loading** - Cards appear with 0.2s delays
- **Book button effects** - Scale and shadow on hover/click

#### Token Packages
- **Rotating background orb** - Subtle animated gradient circle
- **Package card animations** - Cards slide up in sequence
- **Price highlight** - Popular package emphasized

#### Testimonials
- **Star rating animation** - Stars appear sequentially
- **Card hover effects** - Enhanced shadow and border color
- **Sequential loading** - Testimonials fade in one by one

#### CTA Section
- **Button animations** - Scale effects on hover/click
- **Shadow enhancements** - Dynamic shadows on interaction

### Teacher Cards (`src/components/teachers/TeacherCard.jsx`)
- **Image zoom on hover** - 1.1x scale with smooth transition
- **Rating badge animation** - Appears with spring bounce
- **Enhanced shadows** - Card shadow increases on hover
- **Border color change** - Subtle indigo border on hover
- **Button animations** - Book button scales and glows

## Focus & Accessibility Features

All interactive elements include:
- **Focus rings** - Visible focus indicators (ring-4)
- **Keyboard navigation** - Full keyboard support
- **Reduced motion support** - Respects user preferences
- **Semantic HTML** - Proper button/link elements

## Performance Optimizations

All animations are optimized for performance:
- **GPU acceleration** - Using transforms and opacity
- **Intersection Observer** - Efficient scroll detection
- **Component memoization** - Prevents unnecessary re-renders
- **Lazy loading** - Images load only when needed

## Customization

### Adjusting Animation Timings
Edit the animation variants in `AnimatedSection.jsx`:
```jsx
fadeInUp: {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  },
},
```

### Changing Hover Effects
Modify `AnimatedCard.jsx` whileHover prop:
```jsx
whileHover={{
  y: -8,  // Lift height
  transition: { duration: 0.3, ease: "easeOut" },
}}
```

### Disabling Animations
Remove `AnimatedSection` or `AnimatedCard` wrappers and use plain divs.

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies
- `framer-motion` - Animation library
- `react` - Core framework

## Build Impact
- **Home.js**: 34.63 kB (gzipped: 8.51 kB)
- Minimal size increase for significant UX improvement
