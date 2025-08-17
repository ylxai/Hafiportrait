# URL Cleanup Guide

## Problem
Beberapa events di database masih menggunakan URL lama `bwpwwtphgute.ap-southeast-1.clawcloudrun.com` yang tidak bisa diakses.

## Files Updated
1. **next.config.js** - Updated image domains to include public IP
2. **Database cleanup** - Need to update existing events

## Manual Cleanup Steps

### Option 1: Browser Console (Recommended)
1. Login ke admin dashboard
2. Open browser console (F12)
3. Copy paste script dari `tmp_rovodev_cleanup_database_urls.js`
4. Run script - akan otomatis update semua events dengan URL lama

### Option 2: Direct Database (Advanced)
1. Connect ke Supabase database
2. Run SQL commands dari `tmp_rovodev_cleanup_old_urls.sql`

## What Gets Updated
- **shareable_link**: `http://bwpwwtphgute...` → `http://147.251.255.227:3000`
- **qr_code**: QR codes regenerated to point to public IP
- **Image domains**: next.config.js updated for proper image loading

## Verification
After cleanup, check:
1. Copy link dari event list → should use `147.251.255.227:3000`
2. QR codes → should point to public IP
3. No more `bwpwwtphgute.ap-southeast-1.clawcloudrun.com` references

## Final Fix Applied
- **database.ts updated**: Now uses `getAppBaseUrl()` instead of `process.env.NEXT_PUBLIC_APP_URL`
- **Server restart required**: To apply database.ts changes
- **New events**: Will automatically save correct URLs to database

## Prevention
- All new events will automatically use correct URLs
- `generateEventUrl()` function ensures consistent URL generation
- Database will store correct URLs from creation
- Copy operations bypass database and generate fresh URLs