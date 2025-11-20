# 🚀 How to Run SQL in Supabase (Fix the Error)

## ❌ The Error You're Seeing

```
ERROR: 42601: syntax error at or near "DASH_COMPLETE_SUPABASE_SETUP"
LINE 1: DASH_COMPLETE_SUPABASE_SETUP.sql
```

**Problem:** You pasted the **filename** instead of the **SQL contents**.

---

## ✅ Correct Steps

### **Step 1: Open the SQL File**
1. In your code editor, open `DASH_COMPLETE_SUPABASE_SETUP.sql`
2. **Select ALL** the contents (Cmd+A / Ctrl+A)
3. **Copy** everything (Cmd+C / Ctrl+C)

### **Step 2: Paste in Supabase**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"** (or use the editor)
3. **Paste** the SQL code (Cmd+V / Ctrl+V)
4. **DO NOT** paste the filename - paste the actual SQL code!

### **Step 3: Run the SQL**
1. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for it to complete
3. You should see: **"Success. No rows returned"**

---

## 📋 What the SQL Does

The SQL file will:
- ✅ Create all database tables
- ✅ Set up indexes for performance
- ✅ Enable Row Level Security (RLS)
- ✅ Create RLS policies
- ✅ Set up triggers
- ✅ Insert default vendor (B.O. Printing)

**Note:** The security warnings you see are **expected** - they'll go away after you run the SQL because it enables RLS on all tables.

---

## 🔍 Quick Check

**Before running:** Make sure you see SQL code like this:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS memorials (
  ...
```

**NOT** the filename:
```
DASH_COMPLETE_SUPABASE_SETUP.sql  ❌
```

---

## 🆘 Still Having Issues?

1. **Make sure you're copying the file CONTENTS, not the filename**
2. **Check the SQL Editor** - you should see actual SQL code
3. **Try running in smaller chunks** if it's too large:
   - Run extensions first
   - Then tables
   - Then policies

---

## ✅ After Running Successfully

1. Go to **Table Editor** → You should see all tables created
2. Go to **Storage** → Create `heaven-assets` bucket
3. Add environment variables to Vercel
4. Test the connection!


