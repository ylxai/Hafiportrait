# GitHub Secrets Setup Guide

## Required Secrets for CI/CD Pipeline

### 1. Deployment Secrets
```bash
PRODUCTION_HOST=147.251.255.227
PRODUCTION_USER=ubuntu
PRODUCTION_SSH_KEY=<your-private-ssh-key>
PRODUCTION_PORT=22
```

### 2. Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

### 3. Application Configuration
```bash
NEXT_PUBLIC_APP_URL=https://hafiportrait.photography
```

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

## Current Status

✅ **Node.js 20** - Updated for Supabase compatibility
✅ **Fallback values** - Build won't fail if secrets missing
✅ **Environment isolation** - Production and development separated

## Next Steps

1. Add the required secrets to GitHub repository
2. Test the CI/CD pipeline
3. Monitor deployment success

## Troubleshooting

If build still fails:
- Check secret names match exactly
- Verify Supabase project is active
- Ensure SSH key has proper permissions