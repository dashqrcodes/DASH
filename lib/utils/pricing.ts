export interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 250,
    description: 'Perfect for traditional memorials',
    features: [
      '4"×6" Memorial Card (two-sided)',
      '20"×30" Mounted Enlargement',
      'QR Code to DASH memorial page'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 350,
    description: 'Complete digital memorial experience',
    features: [
      'Everything in Basic',
      'AI-Powered Photo Slideshow',
      'Music integration',
      'Social memory wall',
      'Video call to HEAVEN (AI avatar)'
    ]
  }
];

export const addOns: AddOn[] = [
  {
    id: 'ai_effects',
    name: 'Heaven AI Video Effects',
    price: 100,
    description: 'Advanced AI animation/effects applied to slideshow & avatar.'
  }
];

export function getTierById(id: string): PricingTier | undefined {
  return pricingTiers.find(tier => tier.id === id);
}

export function getAddOnById(id: string): AddOn | undefined {
  return addOns.find(addon => addon.id === id);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

export function calculateTotal(baseTierId: string, selectedAddOnIds: string[] = []): number {
  const tier = getTierById(baseTierId);
  if (!tier) return 0;
  const addOnTotal = selectedAddOnIds
    .map(id => getAddOnById(id)?.price || 0)
    .reduce((a, b) => a + b, 0);
  return tier.price + addOnTotal;
}
