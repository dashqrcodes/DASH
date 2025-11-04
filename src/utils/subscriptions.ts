export interface SubscriptionTier {
  id: string;
  name: string;
  price: number; // Annual price
  monthlyPrice: number;
  description: string;
  features: string[];
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'good',
    name: 'Good',
    price: 99, // $99/year = $8.25/month
    monthlyPrice: 8.25,
    description: 'Essential memorial features',
    features: [
      'Digital memorial page',
      'Photo storage (up to 100 photos)',
      'Basic slideshow playback',
      'Memory wall comments',
      'QR code access',
      'Mobile-responsive design'
    ]
  },
  {
    id: 'better',
    name: 'Better',
    price: 199, // $199/year = $16.58/month
    monthlyPrice: 16.58,
    description: 'Enhanced memorial experience',
    features: [
      'Everything in Good',
      'Unlimited photo storage',
      'Video uploads (up to 10 videos)',
      'Music integration (Spotify/Apple Music)',
      'Life chapters organization',
      'Enhanced slideshow effects',
      'Priority support'
    ]
  },
  {
    id: 'best',
    name: 'AI HEAVEN',
    price: 499, // $499/year = $41.58/month
    monthlyPrice: 41.58,
    description: 'Premium AI-powered memorial experience',
    features: [
      'Everything in Better',
      'AI animated photo slideshow',
      'Video call to HEAVEN (AI avatar)',
      'Voice cloning technology',
      'Personality simulation',
      'VR/AR compatibility',
      'Advanced memory wall features',
      'AI photo enhancement',
      'Priority processing',
      'Direct founder support'
    ]
  }
];

export function getSubscriptionById(id: string): SubscriptionTier | undefined {
  return subscriptionTiers.find(tier => tier.id === id);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

export function calculateAnnualSavings(monthlyPrice: number): number {
  return (monthlyPrice * 12) - calculateAnnualPrice(monthlyPrice);
}

export function calculateAnnualPrice(monthlyPrice: number): number {
  return Math.round(monthlyPrice * 12 * 0.83); // 17% savings for annual
}

