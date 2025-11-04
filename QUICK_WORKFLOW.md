# 🎯 YOUR DAILY WORKFLOW (Copy This!)

## **MORNING STARTUP**
```bash
cd "/Users/davidgastelum/DASH Repository Web App/nextjs-auth-app"
git pull origin main          # Get latest changes
npm run dev                   # Start local server
```

## **WHILE CODING**
1. Make changes in Cursor
2. Test at `http://localhost:3000`
3. **Every 1-2 hours, run:**
   ```bash
   ./quick-push.sh "WIP: [describe what you're working on]"
   ```

## **BEFORE CLOSING CURSOR**
```bash
# Final commit of the day
./quick-push.sh "End of day: [summary of work]"

# Verify
git status                    # Should show "nothing to commit"
```

## **VERIFY DEPLOYMENT**
1. Check: https://vercel.com/dashboard
2. See new deployment appear (usually within 1-2 minutes)
3. Test: https://nextjs-auth-app-david-gastelums-projects.vercel.app

---

## **QUICK COMMANDS**

```bash
# Status check
git status

# Quick commit & push
./quick-push.sh "Your message"

# See recent commits
git log --oneline -5

# Pull latest
git pull origin main
```

---

## **THE RULE**

**Commit every 1-2 hours. Never leave uncommitted work overnight.**

