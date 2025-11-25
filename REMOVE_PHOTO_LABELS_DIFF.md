# Diff: Remove All Static Text Labels from Photo Cards/Upload Components

## File 1: `src/pages/life-chapters-oct31.tsx`

### Change 1: Remove text labels from "Scan Physical Photo" button (lines ~450-466)
**REMOVE:**
```jsx
<div style={{
  fontSize:'clamp(15px, 3.5vw, 17px)',
  fontWeight:'700',
  color:'white',
  marginBottom:'2px'
}}>
  {t.scanPhysicalPhoto}
</div>
<div style={{
  fontSize:'clamp(11px, 2.5vw, 13px)',
  opacity:0.8,
  color:'white',
  lineHeight:'1.3'
}}>
  {t.scanSubtitle}
</div>
```

**REPLACE WITH:** Just the icon/button, no text

---

### Change 2: Remove text labels from "Add Photos & Videos" button (lines ~493-505)
**REMOVE:**
```jsx
<div style={{
  fontSize:'clamp(16px, 4vw, 18px)',
  fontWeight:'700',
  marginBottom:'4px'
}}>
  {isProcessing ? t.processing : photos.length === 0 ? t.addPhotosVideos : `${t.addMore} (${photos.length} ${t.memories})`}
</div>
<div style={{
  fontSize:'clamp(12px, 3vw, 14px)',
  opacity:0.95
}}>
  {t.startFromEarliest}
</div>
```

**REPLACE WITH:** Just the icon/button, no text

---

### Change 3: Remove empty state messages (lines ~533-552)
**REMOVE:**
```jsx
{photos.length === 0 ? (
  <div style={{
    textAlign:'center',
    padding:'60px 20px',
    opacity:0.6
  }}>
    <div style={{
      fontSize:'clamp(16px, 4vw, 18px)',
      marginBottom:'12px',
      fontWeight:'600'
    }}>
      {t.storyBegins}
    </div>
    <div style={{
      fontSize:'clamp(13px, 3vw, 15px)',
      lineHeight:'1.6',
      opacity:0.8
    }}>
      {t.addPhotosHelp}<br/>
      {t.arrangeChronologically}
    </div>
  </div>
) : (
```

**REPLACE WITH:**
```jsx
{photos.length === 0 ? (
  <div style={{height:'40vh'}} />
) : (
```

---

## File 2: `src/pages/slideshow.tsx`

### Change 1: Remove "Start here" text label (lines ~2031-2042)
**REMOVE:**
```jsx
<div
  style={{
    textAlign:'center',
    fontSize:'11px',
    letterSpacing:'0.12em',
    textTransform:'uppercase',
    color:'rgba(255,255,255,0.5)',
    marginBottom:'8px'
  }}
>
  Start here
</div>
```

**REPLACE WITH:** Nothing (remove entire div)

---

## Summary

All static text labels mentioning "Photo" or providing instructions will be removed from:
- Photo upload buttons (Scan Photo, Add Photos buttons)
- Empty state messages
- Helper text labels

**Result:** 100% text-free slideshow editing UI - only images, icons, and control buttons remain.

