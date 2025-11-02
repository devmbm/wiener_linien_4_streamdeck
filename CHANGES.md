# Latest Changes

## Version 0.1.1 - Bug Fixes and Improvements

### Fixed Issues

✅ **Text Alignment** - Changed from middle to **top (left-aligned)** to match 3-line layout
✅ **Error Handling** - Added comprehensive logging to diagnose API fetch errors
✅ **Settings Refresh** - Added "Refresh Now" button in Property Inspector

### Changes Made

#### 1. Text Alignment
- **Before:** Text was center-aligned (middle)
- **After:** Text is top-aligned and left-aligned
- **File:** `manifest.json` - Changed `TitleAlignment` from "middle" to "top"

#### 2. Enhanced Error Logging

Added detailed logging to diagnose "Error Fetching Data" issues:

**In `wienerlinien-client.ts`:**
- Logs full API URL being called
- Logs HTTP response status code
- Logs response body length
- Logs JSON parse errors with partial response text
- Logs full error stack traces
- Validates response structure with detailed debug info

**In `departure-monitor.ts`:**
- Logs when monitoring starts with RBL and refresh interval
- Logs each fetch attempt with RBL and action ID
- Logs when departures are found or not found
- Logs detailed error information with stack traces
- Tracks action settings in memory for refresh button

#### 3. "Refresh Now" Button

**Added to Property Inspector (`departure-monitor.html`):**
- New button labeled "Refresh Now"
- Sends `refreshNow` event to plugin when clicked
- Clears cache and fetches fresh data immediately
- Works independently of auto-refresh interval

**Plugin Handler (`departure-monitor.ts`):**
- Added `onSendToPlugin()` handler
- Listens for `refreshNow` events
- Validates RBL number before refreshing
- Clears API cache to force fresh fetch
- Logs refresh attempts for debugging

### How to Debug "Error Fetching Data"

1. **Enable Developer Mode:**
   ```bash
   streamdeck dev
   ```

2. **Open Chrome DevTools:**
   - Visit http://localhost:23654/
   - Find the plugin process
   - Open the console

3. **Check the logs for:**
   - `Fetching departures from:` - Shows the exact URL
   - `API response status:` - Shows HTTP status code (should be 200)
   - `API response length:` - Shows response size in bytes
   - `Failed to parse JSON` - Indicates API returned non-JSON
   - `No monitors found` - RBL number might be invalid
   - Network errors - Check internet connection

### Common Error Causes and Solutions

**"Error Fetching Data" - Possible Causes:**

1. **Invalid RBL Number**
   - Check logs for "No monitors found"
   - Verify RBL at https://till.mabe.at/rbl/
   - Try a known-good RBL like 4907

2. **Network Issues**
   - Check internet connection
   - Try accessing https://www.wienerlinien.at/ogd_realtime/monitor?rbl=4907 in browser
   - Check firewall/proxy settings

3. **API Down**
   - Check logs for HTTP error codes (500, 503)
   - Wait a few minutes and try "Refresh Now"
   - Wiener Linien API might be temporarily unavailable

4. **JSON Parse Error**
   - Check logs for "Failed to parse JSON"
   - API might be returning HTML error page
   - Check if API endpoint URL changed

### Testing Checklist

- [ ] Remove old action, add fresh "Departure Monitor"
- [ ] Text should be left-aligned (top alignment)
- [ ] Enter RBL 4907 (Karlsplatz U1)
- [ ] Wait for departure data to appear
- [ ] Click "Refresh Now" button in settings
- [ ] Check logs in developer console for any errors
- [ ] Verify countdown updates every 30 seconds (or your chosen interval)

### Display Format

```
25          ← Minutes (large, top line, left-aligned)
Kagran      ← Destination (left-aligned)
4           ← Line number (left-aligned)
```

**Visual Style:**
- Background: Black
- Text Color: Yellow (#d0cd08)
- Alignment: Top-left
- Font Size: 16pt base

---

## How to View Logs

### Method 1: Chrome DevTools (Recommended)
```bash
streamdeck dev
```
Then visit http://localhost:23654/ and open the plugin console

### Method 2: Log Files
Logs are written to:
```
%USERPROFILE%/logs/com.leberkaese-mit-alles.wienerlinien.*.log
```

### What to Look For

**Successful Fetch:**
```
[INFO] Fetching departures from: https://www.wienerlinien.at/ogd_realtime/monitor?rbl=4907
[DEBUG] API response status: 200 OK
[DEBUG] API response length: 5432 bytes
[INFO] Successfully fetched 10 departures for RBL 4907
[DEBUG] Updated action abc123: U1 to Leopoldau in 3 min
```

**Failed Fetch:**
```
[INFO] Fetching departures from: https://www.wienerlinien.at/ogd_realtime/monitor?rbl=9999
[DEBUG] API response status: 200 OK
[DEBUG] API response length: 156 bytes
[WARN] No monitors found in API response for RBL 9999
[ERROR] Failed to fetch departures for RBL 9999: No monitors found
```

---

## Next Steps

If you still see "Error Fetching Data":

1. Check developer console logs (see above)
2. Verify RBL number is correct
3. Test with known-good RBL: 4907
4. Check internet connection
5. Try "Refresh Now" button
6. Wait 1-2 minutes for automatic retry

If issues persist, share the console log output for further diagnosis.
