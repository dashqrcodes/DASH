# DASH Design System - Button Styles

## 🎨 Design Philosophy

**Progressive Design Language**: Transition from playful onboarding to professional product experience.

---

## 📱 Onboarding Flow (Pill Style - 30px border-radius)

**Purpose**: Friendly, welcoming, Spotify-like familiarity

**Screens**:
- Sign Up (`/sign-up`)
- Face ID (`/face-id`)
- Account Created (`/account-created`)

**Button Style**:
- `border-radius: 30px` (pill shape)
- Playful, approachable
- Creates emotional connection
- Makes Spotify users feel at home

**Elements**:
- Social login buttons (Spotify, Google, Apple)
- "LET'S GET STARTED" button
- Phone number input
- Primary CTAs

---

## 🏛️ Product Hub & Beyond (Rounded Rectangles - 12-16px border-radius)

**Purpose**: Professional, serious, memorial-appropriate

**Screens**:
- Dashboard/Product Hub (`/dashboard`)
- Card Builders (`/memorial-card-builder-4x6`, `/poster-builder`)
- Checkout (`/checkout`)
- All product customization screens

**Button Style**:
- `border-radius: 12px` - Small buttons, cards
- `border-radius: 16px` - Medium buttons, containers
- Professional, respectful
- Appropriate for memorial context

**Elements**:
- Product cards
- Form inputs
- Action buttons
- Modal buttons
- Navigation elements

---

## 📐 Border Radius Guidelines

### Onboarding (Pill - 30px):
```css
border-radius: 30px; /* Fully rounded, pill shape */
```

### Product Hub (Rounded Rectangle - 12-16px):
```css
border-radius: 12px; /* Small elements */
border-radius: 16px; /* Medium elements */
```

---

## 🎯 When to Use Each Style

### Use Pill Style (30px) When:
- ✅ Onboarding screens
- ✅ Social login buttons
- ✅ Primary CTAs in onboarding flow
- ✅ Creating emotional connection
- ✅ Making Spotify users comfortable

### Use Rounded Rectangle (12-16px) When:
- ✅ Product selection screens
- ✅ Form inputs
- ✅ Product cards
- ✅ Professional contexts
- ✅ Memorial-specific features

---

## 🔄 Design Transition

**User Journey**:
1. **Sign Up** → Pill buttons (friendly welcome)
2. **Face ID** → Pill buttons (comfortable authentication)
3. **Account Created** → Pill buttons (celebratory)
4. **Product Hub** → Rounded rectangles (professional)
5. **Card Builder** → Rounded rectangles (serious, respectful)

**Visual Metaphor**:
- **Onboarding** = "Come in, you're welcome here!" (pill)
- **Products** = "Let's create something beautiful together" (rounded rectangle)

---

## 📝 Implementation Notes

- Onboarding screens: `signup.css` → `border-radius: 30px`
- Product hub: `product-hub.css` → `border-radius: 12px` or `16px`
- Consistent within each phase
- Clear visual distinction between phases

---

## ✅ Current Status

- ✅ Sign-up buttons: Pill style (30px)
- ✅ Social buttons: Pill style (30px)
- ✅ Product hub cards: Rounded rectangles (16px)
- ✅ Product hub buttons: Rounded rectangles (12px)

