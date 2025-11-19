# User Account Architecture

## Current State
- **`/profile`** = Memorial creation page (for deceased loved one)
- No user account dashboard
- Users can't manage multiple memorials

## New Structure

### 1. User Account Dashboard (`/account` or `/dashboard`)
- User's personal account page
- Shows all memorials they've created
- Can create new memorials
- Settings, profile info, etc.

### 2. Memorial Creation (`/create-memorial` or `/memorial/new`)
- Rename current `/profile` to this
- Create a new memorial for a loved one
- Each memorial is separate

### 3. Memorial Management
- Each memorial has its own URL: `/memorial/[memorial-id]`
- Users can have multiple memorials
- Memorials stored with user ID

## Data Structure

```typescript
// User Account
interface UserAccount {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  memorials: string[]; // Array of memorial IDs
}

// Memorial (Loved One Profile)
interface Memorial {
  id: string;
  userId: string; // Owner of this memorial
  lovedOneName: string;
  sunrise: string;
  sunset: string;
  photo: string;
  slideshowMedia: MediaItem[];
  // ... other memorial data
}
```

## Routes

- `/account` - User dashboard (all their memorials)
- `/create-memorial` - Create new memorial (current `/profile`)
- `/memorial/[id]` - View specific memorial
- `/memorial/[id]/edit` - Edit memorial
- `/slideshow?memorialId=xxx` - Slideshow for specific memorial

## Implementation Plan

1. Create `/account` page (user dashboard)
2. Rename `/profile` to `/create-memorial`
3. Update navigation to go to account dashboard
4. Store memorials with user ID
5. Allow users to switch between memorials

