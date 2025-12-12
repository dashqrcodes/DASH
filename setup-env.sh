#!/bin/bash
# Quick setup script for Supabase environment variables

cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://urnkszyyabomkpujkzo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybmtzenlieWFib21rcHVqa3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzM2MTcsImV4cCI6MjA3Njg0OTYxN30.TqwxERGGqOPBlwlhyidUmZ2ktFFaLT2FMfZvreicNt4

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://936793599379724:Tejbnin77Rb6AE2Am5g8CvMSF3s@djepgisuk
CLOUDINARY_CLOUD_NAME=djepgisuk
CLOUDINARY_API_KEY=936793599379724
CLOUDINARY_API_SECRET=Tejbnin77Rb6AE2Am5g8CvMSF3s
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djepgisuk
EOF

echo "✅ Created .env.local file with Supabase and Cloudinary credentials"
echo "📝 Next step: Run the SQL schema in Supabase dashboard"

