# Fellow Accounts Setup Instructions

This migration creates fellow accounts and their associated ventures based on the signed fellows data.

## Overview

The migration creates 7 fellow accounts with their ventures:

1. **Urav Shah** - Evos
2. **Alexandra Coleman** - Azraq
3. **Ganesh Sahane** - Durian Labs
4. **Amyn Haji** - Mentix
5. **Ruby Smith** - Serve
6. **Phares Kariuki** - Ruckstack
7. **Dr Satheesh** - Barrier Intelligence

## Setup Steps

### Option 1: Manual Setup (Recommended)

1. **Run the SQL migration** in Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of 008_seed_fellow_accounts.sql
   ```

2. **Create Auth Users** in Supabase Dashboard:
   - Go to Authentication > Users
   - For each fellow, create a new user with their email
   - Copy the User ID for each user

3. **Link Auth Users to Fellows**:
   Run this SQL for each fellow (replace `{AUTH_USER_ID}` and `{FELLOW_NAME}`):
   ```sql
   UPDATE fellows 
   SET auth_user_id = '{AUTH_USER_ID}'
   WHERE full_name = '{FELLOW_NAME}';
   ```

### Option 2: Automated Setup (Using Supabase Admin API)

If you have access to the Supabase service role key, you can use the provided Node.js script:

1. **Set environment variables**:
   ```bash
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Run the setup script**:
   ```bash
   node scripts/setup-fellow-accounts.js
   ```

   Note: You'll need to provide email addresses and temporary passwords for each fellow.

## Fellow Details

### Urav Shah - Evos
- **Email**: Update with actual email
- **Venture**: Evos (AI/ML Infrastructure)
- **Status**: Demo active, actively pitching to customers
- **Qatar Impact**: Strategic advantage in Agentic Operator adoption

### Alexandra Coleman - Azraq
- **Email**: Update with actual email
5%
- **Venture**: Azraq (Infrastructure/Construction Tech)
- **Status**: Actively generating revenue ~$75k, >15 customer pipeline
- **Qatar Impact**: Derisk data centre construction projects

### Ganesh Sahane - Durian Labs
- **Email**: Update with actual email
10%
- **Venture**: Durian Labs (Biotech/Pharma)
- **Status**: Backend software developed, use cases in development
- **Qatar Impact**: Decrease cost of research for regional illnesses

### Amyn Haji - Mentix
- **Email**: Update with actual email
4%
- **Venture**: Mentix (Healthcare/EdTech)
- **Status**: Forming distribution partnerships, developing platform
- **Qatar Impact**: Increase access to global experts for healthcare training

### Ruby Smith - Serve
- **Email**: Update with actual email
10%
- **Venture**: Serve (Healthcare Tech)
- **Status**: Concept scoping
- **Qatar Impact**: Map healthcare services market, create brokerage platform

### Phares Kariuki - Ruckstack
- **Email**: Update with actual email
6%
- **Venture**: Ruckstack (AI Infrastructure)
- **Status**: Concept development, GTM refinement
- **Qatar Impact**: Low cost infra model for SME/Startup ecosystem

### Dr Satheesh - Barrier Intelligence
- **Email**: Update with actual email
10%
- **Venture**: Barrier Intelligence (Energy/Oil & Gas Tech)
- **Status**: Concept in development, first GTM testing
- **Qatar Impact**: Decrease safety risk in energy sector

## Post-Setup

After creating the accounts:

1. **Update email addresses** in the `fellows` table with actual emails
2. **Send invitation emails** to fellows with their login credentials
3. **Assign fellows to pods** if applicable (update `pod_id` in `fellows` table)
4. **Initialize stipend tracking** using the admin interface or `initFellowStipends` function

## Verification

Verify the setup by checking:

```sql
-- Count fellows
SELECT COUNT(*) FROM fellows WHERE role = 'fellow';

-- Count ventures
SELECT COUNT(*) FROM ventures;

-- View fellows with their ventures
SELECT 
  f.full_name,
  f.email,
  v.name as venture_name,
  v.description,
  v.alignment_notes
FROM fellows f
LEFT JOIN ventures v ON v.fellow_id = f.id
WHERE f.role = 'fellow'
ORDER BY f.full_name;
```
