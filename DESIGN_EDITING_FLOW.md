# 🎨 Design Editing Flow (Next.js React)

## How It Works:

### 1. **Card Renders** (Initial State)
```
┌─────────────────────────┐
│  Front Side Preview     │
│                         │
│  [Round + Button]      │ ← Click to add photo
│                         │
│  Name: ___              │ ← Click to edit inline
│  Dates: ___             │ ← Click to edit inline
└─────────────────────────┘
```

### 2. **User Clicks Photo Button**
→ File picker opens INSTANTLY (native HTML5)
→ Photo uploads to Cloudinary
→ Preview updates in real-time
→ No page reload!

### 3. **User Clicks Text to Edit**
```
┌─────────────────────────┐
│  Front Side Preview     │
│                         │
│  [Photo uploaded]       │
│                         │
│  ┌───────────────────┐  │
│  │ Maria Guadalupe   │  │ ← Overlay input appears
│  │ [X Edit]          │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ June 28, 1965     │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### 4. **User Types in Overlay**
→ Text updates LIVE as they type
→ See exact final result
→ Can drag/resize photo
→ Can change fonts instantly

### 5. **Switch Between Front/Back**
→ Single button to flip
→ Instant preview
→ All data preserved

### 6. **Final Checkout**
→ "Approve & Add to Cart"
→ Stripe payment
→ Auto-generate PDF
→ Send to print shop

## Key Features:

✅ **Inline editing** = Click anywhere, edit there
✅ **Live preview** = See changes instantly  
✅ **No separate forms** = Everything on card
✅ **Mobile-friendly** = Touch works perfectly
✅ **Cloudinary integration** = Real photo uploads
✅ **State management** = Smooth interactions

Like Canva but for memorial cards!
