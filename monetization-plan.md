# DASH Monetization Plan

## Current Pilot Pricing (Groman Mortuary)

### Package Pricing
- **100 4"×6" Memorial Cards w/QR**: $250
- **20"×30" Portrait w/QR**: $350
- **Photo Slideshow Package**: $500
  - Up to 200 photos
  - 5 AI animated photos to video
  - 10 video clips
  - 5 songs

### Cost Breakdown
- **Print Shop**: $70
- **DASH (Platform)**: $50
- **Uber Delivery**: $5 + $5 tip = $10
- **Sales Tax**: Variable
- **Total Cost**: ~$130
- **Gross Margin**: ~$1,120 (82% margin)

---

## HEAVEN Feature Monetization

### Cost Analysis

**AI Service Costs (per HEAVEN call):**
- **ElevenLabs Voice Cloning**: ~$0.30 per minute of audio
- **D-ID/HeyGen Avatar Generation**: ~$0.10-0.20 per minute of video
- **Audio Extraction (ffmpeg)**: Minimal server cost
- **Video Storage (Mux/Supabase)**: ~$0.01 per GB

**Estimated Cost per 5-minute HEAVEN call:**
- Voice cloning (one-time): $1.50
- Video generation: $0.50-1.00
- Storage/bandwidth: $0.10
- **Total: ~$2.10-2.60 per call**

### Monetization Models

#### Option 1: Pay-Per-Call (Recommended)
- **Creator pays**: $5 per HEAVEN call enabled
- **Visitor pays**: $2.99 per call (or free with ads)
- **Revenue split**: 60% DASH / 40% Creator
- **Break-even**: ~2 calls per enabled session

**Pricing Tiers:**
- **Free Tier**: 1 call per memorial (sponsored by funeral home)
- **Basic**: $2.99 per call
- **Premium**: $9.99 for 5 calls bundle
- **Unlimited**: $19.99/month subscription (for frequent visitors)

#### Option 2: Subscription Model
- **Creator Subscription**: $29/month per memorial
  - Unlimited HEAVEN calls
  - Priority AI processing
  - Advanced customization
- **Visitor Access**: Free (cost covered by creator)

#### Option 3: Credit System
- **Creator buys credits**: $50 for 20 calls ($2.50/call)
- **Bulk discounts**: 
  - 50 calls: $100 ($2/call)
  - 100 calls: $180 ($1.80/call)
- **Visitor uses credits**: Free (pre-paid by creator)

#### Option 4: Hybrid Model (Best for Sustainability)
- **Setup Fee**: $49 one-time (covers initial voice cloning)
- **Per-Call Fee**: $1.99 per call (visitor pays)
- **Creator gets**: 20% revenue share
- **DASH margin**: ~$1.50 per call after costs

---

## Recommended Pricing Strategy

### For Funeral Directors (B2B)
**Package Add-Ons:**
- **HEAVEN Enabled**: +$99 to base package
  - Includes: Voice cloning, avatar setup, 10 free calls
  - Additional calls: $1.99 each
- **HEAVEN Premium**: +$199
  - Unlimited calls for 1 year
  - Priority processing
  - Custom avatar options

### For Visitors (B2C)
**Call Pricing:**
- **First Call Free** (sponsored by FD)
- **Subsequent Calls**: $2.99 each
- **5-Call Bundle**: $9.99 (save $5)
- **Monthly Pass**: $19.99 (unlimited calls)

### Revenue Projections

**Scenario 1: 100 Memorials/Month**
- 50% enable HEAVEN: 50 memorials
- Average 3 calls per memorial: 150 calls
- Revenue: 150 × $2.99 = $448.50
- Costs: 150 × $2.50 = $375
- **Net Profit: $73.50/month**

**Scenario 2: Premium Package**
- 50 memorials × $199 = $9,950/month
- Costs: 50 × $2.50 = $125
- **Net Profit: $9,825/month**

**Scenario 3: Hybrid (Recommended)**
- 50 memorials × $99 setup = $4,950
- 150 calls × $1.99 = $298.50
- Costs: 50 × $2.50 + 150 × $2.50 = $500
- **Net Profit: $4,748.50/month**

---

## Implementation Plan

### Phase 1: Creator Control
- ✅ Toggle to enable/disable HEAVEN on memorial profile
- ✅ Creator dashboard to manage HEAVEN settings
- ✅ Usage analytics and call history

### Phase 2: Payment Integration
- Stripe integration for visitor payments
- Creator revenue dashboard
- Automated payouts to creators

### Phase 3: Pricing Tiers
- Free tier (1 call sponsored)
- Pay-per-call
- Bundle packages
- Subscription options

### Phase 4: Optimization
- Cost reduction through bulk AI processing
- Caching frequently used voices/avatars
- CDN optimization for video delivery

---

## Key Metrics to Track

1. **HEAVEN Adoption Rate**: % of memorials with HEAVEN enabled
2. **Call Conversion Rate**: % of visitors who make a call
3. **Average Calls per Memorial**: Usage frequency
4. **Revenue per Memorial**: Total revenue / memorial count
5. **Cost per Call**: AI service costs / total calls
6. **Customer Lifetime Value**: Revenue per memorial over time

---

## Competitive Advantages

1. **First-Mover**: Unique AI memorial experience
2. **Emotional Value**: High willingness to pay for connection
3. **Scalable**: Low marginal costs after initial setup
4. **Network Effects**: More memorials = more value

---

## Risk Mitigation

1. **Cost Overruns**: Set call time limits (5-10 min max)
2. **Low Adoption**: Start with free tier, build demand
3. **Technical Issues**: Fallback to pre-recorded messages
4. **Payment Friction**: One-click payment, Apple Pay/Google Pay

---

## Next Steps

1. ✅ Add HEAVEN toggle to creator dashboard
2. ✅ Implement payment gateway (Stripe)
3. ✅ Add call time limits and usage tracking
4. ✅ Create pricing page for visitors
5. ✅ Build creator revenue dashboard
6. ✅ A/B test pricing models
7. ✅ Optimize AI costs through caching
