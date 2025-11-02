# Quick Start Guide

## What Changed

✅ **Settings now update automatically** - When you change the RBL number, it updates immediately
✅ **Configurable refresh interval** - Choose how often to fetch new data (10-300 seconds)
✅ **Manual refresh on button press** - Press the button to force an immediate update

## Setup Steps

### 1. Remove Old Action (if you have one)
- Delete any old "Counter" action from your Stream Deck

### 2. Restart Stream Deck Software
- Close Stream Deck completely
- Reopen Stream Deck

### 3. Add the Departure Monitor
- Find "wienerlinien" category in actions list
- Drag "Departure Monitor" onto your Stream Deck

### 4. Configure Settings
Click the action to see settings panel:

**RBL Number** (Required)
- Enter the RBL number for your stop
- Example: `4907` for Karlsplatz U1 → Leopoldau
- Find RBL numbers at: https://till.mabe.at/rbl/

**Refresh Interval** (Optional)
- Default: 30 seconds
- Range: 10-300 seconds (adjustable with slider)
- Choose based on how frequently you need updates

### 5. Wait for Data
- The display will show "Loading..." initially
- Within a few seconds, you should see:
  ```
  U1
  Leopoldau
  5
  ```

## How It Works

### Automatic Updates
- The plugin fetches new departure data at your chosen refresh interval
- Default is every 30 seconds
- Data is cached for 30 seconds to reduce API load

### Manual Refresh
- **Press the button** to force an immediate refresh
- Useful when you want the latest data right away
- Shows ✓ on success or ⚠ on error

### Settings Changes
- Changes to RBL number or refresh interval take effect **immediately**
- No need to remove and re-add the action
- The plugin automatically restarts monitoring with new settings

## Display Format

```
26A         ← Line code (LARGE, top line, left-aligned)
Kagran      ← Destination (original case, left-aligned)
12          ← Minutes until departure (* if now, left-aligned)
```

**Visual Style:**
- **Background:** Black (no background image)
- **Text Color:** Yellow (#d0cd08)
- **Alignment:** Top-left
- **Line 1:** Line code - larger font
- **Line 2:** Destination - preserves original case
- **Line 3:** Minutes or "*" if departing now

## Test RBL Numbers

Use these to test the plugin:

| Location | Line | Direction | RBL | Expected |
|----------|------|-----------|-----|----------|
| Karlsplatz | U1 | Leopoldau | 4907 | U1 departures |
| Karlsplatz | U1 | Oberlaa | 4908 | U1 departures |
| Schwedenplatz | U4 | Hütteldorf | 4201 | U4 departures |
| Praterstern | U1 | Leopoldau | 4903 | U1 departures |
| Stephansplatz | U1 | Leopoldau | 4905 | U1 departures |

## Troubleshooting

### "No RBL Set in Settings"
- You haven't entered an RBL number yet
- Click the action and enter a valid RBL number

### "Invalid RBL Number"
- The RBL must be numeric only
- Check the number at https://till.mabe.at/rbl/

### "No Departures Soon"
- No departures scheduled in next 70 minutes
- Normal for night buses or infrequent lines

### "Error Fetching Data"
- API is temporarily unavailable
- Check your internet connection
- Press button to retry

### Settings Not Updating
1. Make sure you're editing the correct action
2. Try pressing the button after changing settings
3. If still not working, remove and re-add the action

### Still Shows "Counter"
- This is an old action instance
- **Delete it** and add a fresh "Departure Monitor" action

## Features

✅ Real-time departures from Wiener Linien
✅ Auto-updates at configurable intervals
✅ Manual refresh by pressing button
✅ Settings changes take effect immediately
✅ Smart caching to reduce API load
✅ Clear error messages
✅ Works with all Vienna public transport lines

## Advanced

### Refresh Interval Recommendations

**Frequent Updates (10-15 seconds)**
- For stops you check constantly
- Short-interval lines (U-Bahn)
- When timing is critical

**Normal Updates (30-60 seconds)**
- Most use cases
- Balanced between freshness and API load
- Default setting

**Infrequent Updates (120-300 seconds)**
- Less-frequently used lines
- When rough timing is enough
- Reduces network usage

### Multiple Stations
- Add multiple "Departure Monitor" actions
- Each can have different RBL numbers
- Each can have different refresh intervals
- Organize on different pages/folders

---

**Need Help?**
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed help
- API Documentation: [docs/WIENER_LINIEN_API.md](docs/WIENER_LINIEN_API.md)
- Find RBL Numbers: https://till.mabe.at/rbl/
