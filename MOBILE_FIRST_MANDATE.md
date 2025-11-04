# MOBILE-FIRST DESIGN MANDATE

## Core Principles (Effective Immediately)

### 1. **Screen Aspect Ratio**
- **Primary**: 9:16 portrait (mobile phone)
- **Viewport**: `100dvh` (dynamic viewport height)
- **Width**: `100vw` (no horizontal scroll)
- **Max Width**: `414px` (iPhone standard)

### 2. **Touch Targets**
- **Minimum**: 44px × 44px (Apple HIG standard)
- **Preferred**: 48px × 48px for primary actions
- **Button Padding**: Minimum 12px on all sides
- **Spacing**: 8px minimum between touch targets

### 3. **Typography**
- **Use `clamp()` for all font sizes**: `clamp(min, preferred, max)`
- **Example**: `fontSize: 'clamp(14px, 4vw, 18px)'`
- **Line Height**: 1.4-1.6 for readability
- **Font Weight**: 400-600 for body, 700 for headings

### 4. **Spacing & Padding**
- **Container Padding**: 16-20px on mobile
- **Section Margins**: 12-16px between sections
- **Element Gap**: 8-12px between related elements
- **Safe Area Insets**: Always use `env(safe-area-inset-*)` for notch support

### 5. **Colors & Contrast**
- **Background**: `#000000` (black) for dark theme
- **Text**: `rgba(255,255,255,0.9)` for primary, `rgba(255,255,255,0.7)` for secondary
- **Buttons**: Gradient `linear-gradient(135deg,#667eea 0%,#764ba2 100%)`
- **Touch Feedback**: Visual feedback on tap (background color change)

### 6. **Scrolling**
- **Smooth Scrolling**: `-webkit-overflow-scrolling: touch`
- **Hide Scrollbars**: `scrollbarWidth: 'none'`, `::-webkit-scrollbar { display: none; }`
- **Overscroll**: `overscrollBehavior: 'none'` to prevent bounce

### 7. **Navigation**
- **Bottom Nav**: Fixed at bottom, `z-index: 1000`
- **Padding Bottom**: `calc(env(safe-area-inset-bottom, 0px) + 80px)` for content
- **Top Bar**: Sticky header with safe area insets

### 8. **Inputs & Forms**
- **Date Inputs**: `minHeight: '44px'`, full width
- **Text Inputs**: `padding: '12px 16px'`, `borderRadius: '12px'`
- **Focus States**: Visible outline/border change

### 9. **Images & Media**
- **Object Fit**: `cover` for thumbnails, `contain` for full-screen
- **Border Radius**: 12-16px for modern look
- **Aspect Ratio**: Maintain 9:16 where appropriate

### 10. **Performance**
- **Touch Action**: `touchAction: 'manipulation'` for fast taps
- **Tap Highlight**: `WebkitTapHighlightColor: 'transparent'`
- **User Select**: `WebkitUserSelect: 'none'` for non-selectable elements
- **Touch Callout**: `WebkitTouchCallout: 'none'` to prevent long-press menu

## Standard Container Structure

```tsx
<div style={{
  width: '100vw',
  height: '100dvh',
  maxHeight: '100dvh',
  background: '#000000',
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  color: 'white',
  padding: '0',
  paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '100vw',
  overflow: 'hidden',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  touchAction: 'manipulation',
  overscrollBehavior: 'none'
}}>
```

## Checklist for Every Page

- [ ] Viewport set to 9:16 aspect ratio
- [ ] All buttons minimum 44px height
- [ ] Font sizes use `clamp()`
- [ ] Safe area insets applied
- [ ] Bottom navigation integrated
- [ ] Touch feedback on interactive elements
- [ ] Smooth scrolling enabled
- [ ] Scrollbars hidden
- [ ] No horizontal overflow
- [ ] Proper spacing (16-20px padding)
- [ ] Mobile-first responsive design

## Testing Requirements

- Test on iPhone (Safari)
- Test on Android (Chrome)
- Check safe area insets (notch support)
- Verify touch targets are easily tappable
- Ensure no horizontal scrolling
- Test scroll performance

