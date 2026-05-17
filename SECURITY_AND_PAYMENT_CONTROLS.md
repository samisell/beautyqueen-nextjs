# BeautyVote Enhanced Security & Payment Gateway Controls

## 1. Payment Gateway Downtime Control

### Overview
Added ability to enable/disable payment gateways without redeploying the application. This allows administrators to quickly disable a payment gateway during downtime or maintenance.

### Environment Variables
Add these to your `.env` file:

```
# Payment Gateway Control (set to 'false' to disable, default: true)
ENABLE_FLUTTERWAVE=true
ENABLE_PAYSTACK=true
```

### How It Works
- The payment gateway configuration now checks these flags
- If set to `false`, the gateway will be treated as not configured
- The system will fall back to demo mode or show appropriate error messages
- No redeployment required - changes take effect immediately

### Example Usage
To disable Flutterwave during maintenance:
```
ENABLE_FLUTTERWAVE=false
```

To re-enable:
```
ENABLE_FLUTTERWAVE=true
```

## 2. Cloudflare Turnstile Bot Protection

### Overview
Added Cloudflare Turnstile integration to protect against bots and automated abuse. This replaces traditional CAPTCHAs with a more user-friendly verification system.

### How It Works
- In production, displays a Turnstile widget that users must complete
- Verifies tokens with Cloudflare's backend
- Only applies to non-Telegram users (Telegram users are already verified)
- Can be enabled/disabled via environment variables

### Environment Variables
Add these to your `.env` file:

```
# Turnstile Configuration
NEXT_PUBLIC_ENABLE_TURNSTILE=true  # Set to 'false' to disable in production
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

### Getting Turnstile Keys
1. Go to https://dash.cloudflare.com
2. Select your domain
3. Go to Turnstile under Security
4. Create a new sitekey
5. Copy both the Site Key (public) and Secret Key (private)

### Behavior
- **Development**: Turnstile is automatically disabled
- **Production**: 
  - If `NEXT_PUBLIC_ENABLE_TURNSTILE=true`: Turnstile verification required
  - If `NEXT_PUBLIC_ENABLE_TURNSTILE=false`: Turnstile disabled
- **Telegram Users**: Bypass Turnstile entirely (already authenticated via Telegram)

### Fallback Behavior
If Turnstile fails to load or verify:
- In development: Always allows through (fail open)
- In production: Logs error but allows through (fail open for usability)
- This prevents blocking legitimate users due to service issues

## Implementation Details

### Payment Gateway Changes
Modified `src/lib/payment-gateways.ts`:
- Added `ENABLE_FLUTTERWAVE` and `ENABLE_PAYSTACK` environment variable checks
- Gateways are now considered configured only if:
  1. Keys are present AND
  2. Enable flag is not set to 'false'

### Turnstile Changes
Modified `src/app/layout.tsx`:
- Added useEffect to load Turnstile script in production when enabled
- Added Turnstile verification logic in `src/app/page.tsx`
- Created API endpoint at `src/app/api/turnstile/route.ts` for token verification

Modified `src/app/page.tsx`:
- Added Turnstile verification state management
- Shows verification UI when required but not yet verified
- Integrates with existing Telegram authentication flow
- Maintains all existing functionality

### Files Modified
1. `src/lib/payment-gateways.ts` - Payment gateway enable/disable control
2. `src/app/layout.tsx` - Turnstile script loading
3. `src/app/page.tsx` - Turnstile verification UI and logic
4. `src/app/api/turnstile/route.ts` - Turnstile token verification endpoint

## Configuration Guide

### For Development
```
# .env
ENABLE_FLUTTERWAVE=true
ENABLE_PAYSTACK=true
NEXT_PUBLIC_ENABLE_TURNSTILE=false  # Auto-disabled in dev
```

### For Production (Normal Operation)
```
# .env
ENABLE_FLUTTERWAVE=true
ENABLE_PAYSTACK=true
NEXT_PUBLIC_ENABLE_TURNSTILE=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key
```

### To Disable a Payment Gateway During Downtime
```
# .env
ENABLE_FLUTTERWAVE=false   # Disable Flutterwave
ENABLE_PAYSTACK=true       # Keep Paystack enabled
```

### To Disable Turnstile Temporarily
```
# .env
NEXT_PUBLIC_ENABLE_TURNSTILE=false
```

## Benefits

### Payment Gateway Control
- **Zero Downtime Maintenance**: Disable problematic gateways instantly
- **Fast Recovery**: Re-enable immediately when service restored
- **No Code Changes**: Pure configuration-based control
- **Graceful Degradation**: Falls back to demo mode or shows clear messages

### Turnstile Protection
- **Bot Prevention**: Stops automated account creation and abuse
- **User Friendly**: No frustrating CAPTCHAs, just a simple widget
- **Privacy Focused**: Cloudflare Turnstile is privacy-first
- **Telegram Exemption**: Telegram users bypass entirely (already verified)
- **Fail Safe**: Designed to allow traffic through if verification fails

## Testing

### Payment Gateway Control
1. Set `ENABLE_FLUTTERWAVE=false` in .env
2. Restart the application
3. Attempt to make a Flutterwave payment
4. Should fall back to demo mode or show appropriate message
5. Set back to `true` and restart to re-enable

### Turnstile Verification
1. Set `NEXT_PUBLIC_ENABLE_TURNSTILE=true` and add your keys
2. Set `NEXT_PUBLIC_ENABLE_TURNSTILE=false` to disable for testing
3. In production, the verification UI should appear before the app loads
4. Complete the widget to proceed to the application

## Notes
- Turnstile only applies to web users, not Telegram users
- Payment gateway controls affect all users equally
- Both features are designed to be fail-safe to prevent blocking legitimate users
- All changes are configuration-only - no code redeployment required