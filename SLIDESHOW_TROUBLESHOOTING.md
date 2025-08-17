# Slideshow Troubleshooting Guide

## Problem
Tombol tambah foto ke slideshow tidak berfungsi, tapi tombol hapus berhasil.

## Debugging Steps

### 1. Check Browser Console
1. Buka admin dashboard
2. Go to Photos > Slideshow tab
3. Open browser console (F12)
4. Try clicking on a homepage photo to add to slideshow
5. Check console logs for errors

### 2. Test API Manually
Run the test script in browser console:
```javascript
// Copy content from tmp_rovodev_test_slideshow_api.js
```

### 3. Common Issues

#### Issue 1: Database Schema Missing
**Symptoms**: API returns error about missing fields
**Solution**: Add required fields to photos table:
```sql
ALTER TABLE photos ADD COLUMN is_slideshow BOOLEAN DEFAULT FALSE;
ALTER TABLE photos ADD COLUMN slideshow_order INTEGER;
ALTER TABLE photos ADD COLUMN slideshow_active BOOLEAN DEFAULT FALSE;
```

#### Issue 2: Photo ID Not Found
**Symptoms**: "Photo ID is required" error
**Solution**: Check if homepage photos have valid IDs

#### Issue 3: Permission Issues
**Symptoms**: 403 or authentication errors
**Solution**: Ensure user is logged in as admin

#### Issue 4: Network Issues
**Symptoms**: Network errors in console
**Solution**: Check if API endpoint is accessible

### 4. Debug Information
The UI now shows debug info:
- Photo count: "(X homepage, Y slideshow)"
- Console logs for photo clicks
- Console logs for API calls

### 5. Expected Behavior
1. Click on homepage photo (not already in slideshow)
2. Should see console log: "Attempting to add photo to slideshow"
3. Should see API call in Network tab
4. Should see success toast
5. Photo should show green checkmark
6. Should appear in slideshow grid above

### 6. API Endpoints
- `GET /api/admin/slideshow` - Get slideshow photos
- `POST /api/admin/slideshow` - Add photo to slideshow
- `DELETE /api/admin/slideshow?photoId=X` - Remove from slideshow

### 7. Required Database Fields
Photos table needs:
- `is_slideshow` (boolean) - Whether photo is in slideshow
- `slideshow_order` (integer) - Order in slideshow
- `slideshow_active` (boolean) - Whether slideshow entry is active