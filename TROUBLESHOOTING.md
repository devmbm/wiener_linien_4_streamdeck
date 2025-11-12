# Troubleshooting Guide

## Issue: "Counter" text with question mark appears

This happens when you have an old action instance on your Stream Deck that no longer exists in the plugin.

### Solution:

**Step 1: Remove the Old Action**
1. Open Stream Deck software
2. Find the button with "Counter" text and question mark
3. Right-click or drag it off your Stream Deck to remove it

**Step 2: Restart Stream Deck Software**
1. Close Stream Deck software completely
2. Reopen Stream Deck software
3. Wait for it to fully load

**Step 3: Add the New Action**
1. Look in the Actions list (right panel)
2. Find the "wienerlinien" category
3. You should see "Departure Monitor" action
4. Drag it onto your Stream Deck

**Step 4: Configure RBL Number**
1. Click the new "Departure Monitor" action
2. In the Property Inspector (right panel), you should see:
   - "RBL Number" field
   - Help section explaining how to find RBL numbers
3. Enter a test RBL number, for example: **4907** (Karlsplatz U1 → Leopoldau)

**Step 5: Wait for Data**
- The action will start fetching departure data automatically
- It should display:
  ```
  U1
  Leopoldau
  [minutes]
  ```

---

## Issue: Settings panel is empty or not showing

### Solution 1: Restart Plugin
```bash
streamdeck restart com.mikel-me.wienerlinien
```

### Solution 2: Full Stream Deck Restart
1. Close Stream Deck software completely
2. Wait 5 seconds
3. Reopen Stream Deck software

### Solution 3: Rebuild and Relink
```bash
cd C:\Users\mkbas\vibecode\streamdeck_wienerlinien\wienerlinien
npm run build
streamdeck restart com.mikel-me.wienerlinien
```

---

## Issue: No departure data showing

**Possible causes:**

### 1. Invalid RBL Number
- **Check:** Is the RBL number correct?
- **Solution:** Verify at https://till.mabe.at/rbl/

### 2. No Internet Connection
- **Check:** Can you access https://www.wienerlinien.at?
- **Solution:** Check your internet connection

### 3. No departures in next 70 minutes
- **Check:** Is it late night or early morning?
- **Solution:** This is normal; the display will show "No Departures Soon"

### 4. API Error
- **Check:** Is the Wiener Linien API down?
- **Solution:** Press the button to retry, or wait a few minutes

---

## Issue: Plugin not appearing in Stream Deck

### Solution 1: Verify Link
```bash
streamdeck link com.mikel-me.wienerlinien.sdPlugin
```

### Solution 2: Check if Plugin is Loaded
1. Open Stream Deck software
2. Go to Plugins tab
3. Look for "wienerlinien"
4. If missing, try relinking

### Solution 3: Validate Manifest
```bash
streamdeck validate com.mikel-me.wienerlinien.sdPlugin
```

---

## Debugging

### Enable Developer Mode
```bash
streamdeck dev
```
Then visit http://localhost:23654/ in Chrome to see developer tools

### Check Plugin Logs
1. Open developer tools (http://localhost:23654/)
2. Find your plugin process
3. Click to open console
4. Look for errors or warnings

### Common Log Messages

**Success:**
```
[INFO] Started monitoring RBL 4907 for action...
[INFO] Successfully fetched X departures for RBL 4907
```

**Errors:**
```
[ERROR] Failed to fetch departures for RBL 4907
[ERROR] No monitors found for RBL...
[ERROR] API request failed: 500
```

---

## Test RBL Numbers

Use these for testing:

| Location | Line | Direction | RBL | Expected Result |
|----------|------|-----------|-----|----------------|
| Karlsplatz | U1 | Leopoldau | 4907 | Should show U1 departures |
| Karlsplatz | U1 | Oberlaa | 4908 | Should show U1 departures |
| Schwedenplatz | U4 | Hütteldorf | 4201 | Should show U4 departures |
| Praterstern | U1 | Leopoldau | 4903 | Should show U1 departures |
| Stephansplatz | U1 | Leopoldau | 4905 | Should show U1 departures |

---

## Still Not Working?

1. **Check Node.js Version:**
   ```bash
   node --version
   ```
   Should be v20.x.x

2. **Rebuild from scratch:**
   ```bash
   cd C:\Users\mkbas\vibecode\streamdeck_wienerlinien\wienerlinien
   rm -rf node_modules
   npm install
   npm run build
   streamdeck restart com.mikel-me.wienerlinien
   ```

3. **Check for TypeScript errors:**
   ```bash
   npm run build
   ```
   Should complete without errors

4. **Verify all files exist:**
   - `com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js` ✓
   - `com.mikel-me.wienerlinien.sdPlugin/ui/departure-monitor.html` ✓
   - `com.mikel-me.wienerlinien.sdPlugin/manifest.json` ✓

---

## Getting Help

If the issue persists:

1. Check the Stream Deck developer console (http://localhost:23654/)
2. Look for error messages in the plugin console
3. Verify the API is accessible: https://www.wienerlinien.at/ogd_realtime/monitor?rbl=4907
4. Check if the API returns valid JSON

---

## Quick Reset

Complete reset of the plugin:

```bash
# Navigate to plugin directory
cd C:\Users\mkbas\vibecode\streamdeck_wienerlinien\wienerlinien

# Rebuild
npm run build

# Restart plugin
streamdeck restart com.mikel-me.wienerlinien

# Then in Stream Deck software:
# 1. Remove all old instances of the action
# 2. Restart Stream Deck software
# 3. Add new "Departure Monitor" action
# 4. Configure with RBL 4907
# 5. Wait for data to load
```
