#!/bin/bash
# Quick commit and push script
# Usage: ./quick-push.sh "Your commit message"

MESSAGE="${1:-Auto commit: $(date +'%Y-%m-%d %H:%M:%S')}"

echo "🚀 Quick Push Script"
echo "==================="
echo ""
echo "Commit message: $MESSAGE"
echo ""

# Check if there are changes
if git diff --quiet && git diff --cached --quiet; then
    echo "✅ No changes to commit"
    exit 0
fi

# Stage all changes
echo "📦 Staging changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "$MESSAGE"

# Push
echo "🚀 Pushing to GitHub..."
git push origin main

# Check Vercel deployment status
echo ""
echo "✅ Changes pushed to GitHub!"
echo "📋 Check Vercel dashboard for deployment status:"
echo "   https://vercel.com/dashboard"
echo ""
echo "🌐 Your app should auto-deploy at:"
echo "   https://nextjs-auth-app-david-gastelums-projects.vercel.app"

