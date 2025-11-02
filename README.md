# Wiener Linien Departure Monitor - Stream Deck Plugin

Real-time departure information from Wiener Linien (Vienna public transport) displayed directly on your Stream Deck.

## Features

- **Real-time departures** - Shows the next departure from any Wiener Linien stop
- **Auto-updates** - Automatically refreshes every 30 seconds
- **Manual refresh** - Press the button to force an immediate update
- **Clean display** - Shows line number, destination, and countdown in minutes

## Display Format

```
26A         ← Line code (LARGE, yellow, left-aligned)
Kagran      ← Destination (yellow, original case, left-aligned)
12          ← Minutes (* if departing now, yellow, left-aligned)
```

**Format:**
- **Line 1 (Large):** Line code (e.g., U1, 26A, 4, N49)
- **Line 2:** Destination - original case preserved
- **Line 3:** Minutes until departure - shows "*" if departing now (≤0 min)

**Visual:**
- **Text Color:** Yellow (#d0cd08)
- **Background:** Black (no background image)
- **Alignment:** Top-left
- **Font Size:** 14pt base, line 1 slightly larger

## Installation

### Prerequisites

- Stream Deck software (version 6.5 or higher)
- Windows 10+ or macOS 12+
- Node.js 20 (for development)

### For Users

1. Download the `.streamDeckPlugin` file from releases
2. Double-click the file to install
3. The plugin will appear in your Stream Deck action list

### For Developers

1. Clone this repository
2. Navigate to the `wienerlinien` directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the plugin:
   ```bash
   npm run build
   ```
5. Link the plugin for development:
   ```bash
   streamdeck link com.leberkaese-mit-alles.wienerlinien.sdPlugin
   ```

## Setup

### Finding Your RBL Number

**RBL numbers** (Rechnergestütztes Betriebsleitsystem) identify specific platforms and directions at Vienna transit stops.

**Method 1: Online Search Tool (Easiest)**
1. Visit https://till.mabe.at/rbl/
2. Search for your stop name
3. Select the line and direction you want to monitor
4. Copy the RBL number

**Method 2: Official Data**
- Download station/platform data from https://www.data.gv.at/katalog/dataset/wiener-linien-echtzeitdaten-via-datendrehscheibe-wien
- Find the RBL number in the CSV files

### Common RBL Examples

| Location | Line | Direction | RBL |
|----------|------|-----------|-----|
| Karlsplatz | U1 | Leopoldau | 4907 |
| Karlsplatz | U1 | Oberlaa | 4908 |
| Schwedenplatz | U4 | Hütteldorf | 4201 |
| Schwedenplatz | U4 | Heiligenstadt | 4202 |
| Praterstern | U1 | Leopoldau | 4903 |

### Configuring the Action

1. Drag the "Departure Monitor" action onto your Stream Deck
2. Click the action to open settings
3. Enter the RBL number in the settings panel
4. The departure information will appear automatically

## Usage

- **Auto-refresh:** The display updates every 30 seconds
- **Manual refresh:** Press the button to force an immediate update
- **No departures:** If no departures are scheduled in the next 70 minutes, the display shows "No Departures Soon"
- **Error state:** If the API is unavailable, the display shows "Error Fetching Data"

## Development

### Project Structure

```
wienerlinien/
├── src/
│   ├── actions/
│   │   └── departure-monitor.ts      # Main action implementation
│   ├── api/
│   │   └── wienerlinien-client.ts    # API client for Wiener Linien
│   ├── types/
│   │   └── wienerlinien.ts           # TypeScript type definitions
│   └── plugin.ts                      # Plugin entry point
├── com.leberkaese-mit-alles.wienerlinien.sdPlugin/
│   ├── ui/
│   │   └── departure-monitor.html    # Property Inspector UI
│   ├── manifest.json                  # Plugin metadata
│   └── bin/
│       └── plugin.js                  # Compiled output
└── docs/
    └── WIENER_LINIEN_API.md          # API documentation
```

### Build Commands

```bash
npm run build        # Build once
npm run watch        # Build and restart on changes
```

### Development Workflow

1. Make code changes in `src/`
2. Run `npm run watch` to auto-rebuild
3. Test changes in Stream Deck
4. Check logs in Stream Deck developer tools

### Debugging

**VS Code Debugger:**
1. Start Stream Deck
2. Press F5 in VS Code to attach debugger
3. Set breakpoints in TypeScript source files

**Stream Deck Developer Mode:**
```bash
streamdeck dev
```
Then visit http://localhost:23654/ for Chrome DevTools

## API

This plugin uses the **Wiener Linien Echtzeitdaten API**:

- **Endpoint:** `https://www.wienerlinien.at/ogd_realtime/monitor`
- **Method:** GET
- **Authentication:** None required
- **License:** CC BY 4.0 (Free to use with attribution)
- **Documentation:** See [docs/WIENER_LINIEN_API.md](docs/WIENER_LINIEN_API.md)

### Features

- Real-time departure data
- 70-minute lookahead
- Traffic disruption information
- No API key required

### Rate Limiting

The plugin implements:
- 30-second cache per RBL number
- Auto-refresh every 30 seconds
- Respectful API usage

## Troubleshooting

### "No RBL Set in Settings"
- You haven't configured an RBL number yet
- Open the action settings and enter a valid RBL number

### "Invalid RBL Number"
- The RBL number must be numeric only
- Check that you've entered the correct number from the search tool

### "No Departures Soon"
- No departures are scheduled in the next 70 minutes
- This is normal for night buses or infrequent lines
- The display will update when a departure becomes available

### "Error Fetching Data"
- The API is temporarily unavailable
- Check your internet connection
- Press the button to retry
- If the problem persists, the Wiener Linien API may be down

### Action not updating
- Press the button to force a manual refresh
- Check the Stream Deck logs for errors
- Verify the RBL number is correct

## Data Attribution

This plugin uses data from:

**Wiener Linien / Stadt Wien**
- Data Portal: https://data.wien.gv.at
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)

The Wiener Linien real-time API is provided as part of Vienna's Open Government Data initiative.

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

- **Issues:** https://github.com/yourusername/streamdeck-wienerlinien/issues
- **RBL Search:** https://till.mabe.at/rbl/
- **API Documentation:** [docs/WIENER_LINIEN_API.md](docs/WIENER_LINIEN_API.md)
- **Stream Deck SDK:** https://docs.elgato.com/sdk

## Changelog

### 0.1.0 (Initial Release)
- Real-time departure display
- Auto-refresh every 30 seconds
- Manual refresh on button press
- RBL number configuration
- Error handling and user feedback

## Roadmap

Future enhancements:
- [ ] Multiple departures display
- [ ] Line filtering options
- [ ] Custom refresh intervals
- [ ] Traffic disruption alerts
- [ ] Favorite stations
- [ ] Icon customization based on line type (U-Bahn, Tram, Bus)

---

**Made with ❤️ for Vienna public transport users**
