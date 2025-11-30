# How to Compile the Wiener Linien Stream Deck Plugin

This guide provides step-by-step instructions for compiling and packaging the Wiener Linien Stream Deck plugin.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Development Workflow](#development-workflow)
4. [Production Build & Packaging](#production-build--packaging)
5. [Understanding the Build Process](#understanding-the-build-process)
6. [Troubleshooting](#troubleshooting)
7. [Technical Reference](#technical-reference)

---

## Quick Start

For experienced developers who just need the commands:

```bash
# Install dependencies (first time only)
npm install

# Development mode (auto-rebuild and restart)
npm run watch

# Production build and package
npm run build
streamdeck pack com.mikel-me.wienerlinien.sdPlugin --force
```

---

## Prerequisites

### Required Software

1. **Node.js** (version 20 or later)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Elgato Stream Deck Software**
   - Download from: https://www.elgato.com/downloads

4. **Stream Deck CLI** (installed via npm)
   ```bash
   npm install -g @elgato/cli
   ```
   - Verify installation: `streamdeck --version`

### Project Setup

1. Navigate to the project directory:
   ```bash
   cd wienerlinien
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

This installs:
- Build tools (Rollup, TypeScript, plugins)
- Stream Deck SDK (`@elgato/streamdeck`)
- Development tools (`@elgato/cli`)

---

## Development Workflow

### Development Mode (Recommended for Testing)

Development mode provides automatic rebuilding and hot-reloading:

1. **Start watch mode:**
   ```bash
   npm run watch
   ```

   This command:
   - Watches `src/` directory for changes
   - Automatically recompiles TypeScript when you save files
   - Restarts the plugin in Stream Deck after each build
   - Includes source maps for easier debugging

2. **What happens:**
   - Initial compilation runs
   - Plugin automatically restarts in Stream Deck
   - Any file changes in `src/` trigger recompilation
   - Plugin restarts after each successful build

3. **Stop watch mode:**
   - Press `Ctrl+C` in the terminal

### Manual Development Build

If you prefer to build manually without watch mode:

```bash
npm run build
streamdeck restart com.mikel-me.wienerlinien
```

### Viewing Logs

Stream Deck plugin logs are written to the console. When running `npm run watch`, you'll see:
- Build output from Rollup
- TypeScript compilation warnings/errors
- Plugin restart confirmations

To view runtime logs from the plugin itself, check the Stream Deck logs directory:
- **Windows:** `%APPDATA%\Elgato\StreamDeck\logs`
- **macOS:** `~/Library/Logs/ElgatoStreamDeck`

---

## Production Build & Packaging

### Creating a Distribution Package

To create a `.streamDeckPlugin` file for distribution:

#### Step 1: Clean Build

```bash
npm run build
```

**What this does:**
- Compiles all TypeScript files from `src/` into a single JavaScript bundle
- Minifies the code using Terser for smaller file size
- Outputs to `com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js`
- Generates source maps (for debugging, not included in package)

**Output:**
- File: `com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js`
- Size: ~84 KB (minified)

#### Step 2: Create Package

```bash
streamdeck pack com.mikel-me.wienerlinien.sdPlugin --force
```

**Output:**
- File: `com.mikel-me.wienerlinien.streamDeckPlugin`
- Size: ~52 KB (compressed)
- Location: Current directory
- Total files: 11

**Package contents:**
- `manifest.json` - Plugin metadata
- `bin/plugin.js` - Compiled and minified code (~84 KB)
- `ui/departure-monitor.html` - Property Inspector configuration interface
- `imgs/` - Plugin icons and images

**Platform Support:**
- ✅ Windows 10/11 (64-bit)
- ✅ macOS 12+ (Intel)
- ✅ macOS 12+ (Apple Silicon M1/M2/M3/M4)
- ✅ Linux (64-bit)

Note: This plugin uses pure SVG rendering, so no platform-specific native binaries are required!

#### Step 3: Verify the Package

Check the package was created:

```bash
ls -lh com.mikel-me.wienerlinien.streamDeckPlugin
```

You should see a file around 52 KB in size.

### Installing the Package

#### For Testing
Double-click the `.streamDeckPlugin` file to install it in Stream Deck.

#### For Distribution
Share the `.streamDeckPlugin` file with users or submit it to the Stream Deck Marketplace.

---

## Understanding the Build Process

### Project Structure

```
wienerlinien/
├── src/                                    # SOURCE CODE (TypeScript)
│   ├── plugin.ts                          # Entry point
│   ├── actions/
│   │   └── departure-monitor.ts           # Main action logic
│   ├── api/
│   │   └── wienerlinien-client.ts        # API calls
│   ├── utils/
│   │   └── svg-renderer.ts               # Pure SVG rendering (no canvas!)
│   └── types/
│       └── wienerlinien.ts               # Type definitions
│
├── com.mikel-me.wienerlinien.sdPlugin/   # PLUGIN BUNDLE
│   ├── manifest.json                      # Plugin metadata
│   ├── bin/
│   │   ├── plugin.js                     # COMPILED OUTPUT
│   │   ├── plugin.js.map                 # Source map (dev only)
│   │   └── package.json                  # ES module marker
│   ├── ui/
│   │   └── departure-monitor.html        # Property Inspector UI
│   └── imgs/                              # Icons and images
│
├── package.json                           # Project dependencies & scripts
├── rollup.config.js                       # Build configuration
└── tsconfig.json                          # TypeScript configuration
```

### Build Pipeline

1. **TypeScript Compilation**
   - Source: `src/**/*.ts`
   - Compiler: TypeScript 5.x
   - Target: ES2022 (modern JavaScript)
   - Module system: ES modules

2. **Module Bundling**
   - Tool: Rollup
   - Entry: `src/plugin.ts`
   - Output: `com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js`
   - Format: ES module

3. **Code Optimization**
   - Minification: Terser plugin
   - Tree shaking: Removes unused code
   - Result: ~84 KB bundle

4. **SVG Rendering**
   - No native dependencies required
   - Pure SVG generation in `svg-renderer.ts`
   - Renders all button states (departures, errors, loading)
   - Cross-platform compatible

### Configuration Files

#### `package.json`

Defines project scripts and dependencies:

```json
{
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w --watch.onEnd=\"streamdeck restart com.mikel-me.wienerlinien\""
  },
  "type": "module",
  "dependencies": {
    "@elgato/streamdeck": "^1.0.0"
  },
  "devDependencies": {
    "@elgato/cli": "^1.5.1",
    "@rollup/plugin-commonjs": "^28.0.0",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^15.2.2",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^12.1.0",
    "rollup": "^4.0.2",
    "typescript": "^5.2.2"
  }
}
```

#### `rollup.config.js`

Rollup bundler configuration:

```javascript
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/plugin.ts',
  output: {
    file: 'com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js',
    sourcemap: true,
    format: 'es'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node']
    }),
    commonjs(),
    json(),
    terser({
      format: {
        comments: false
      }
    })
  ]
};
```

**Key configuration details:**
- **Input:** `src/plugin.ts` - Entry point for compilation
- **Output:** `com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js` - Bundled plugin code
- **Source maps:** Enabled for debugging (not included in final package)
- **Format:** ES modules (`format: 'es'`)
- **Minification:** Terser removes comments and minifies code
- **Node resolution:** Handles `node_modules` imports
- **CommonJS support:** Converts CommonJS modules to ES modules

#### `tsconfig.json`

TypeScript compiler configuration:

```json
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"]
}
```

#### `manifest.json`

Stream Deck plugin metadata:

```json
{
  "Name": "Wiener Linien Information",
  "Version": "0.5.0.0",
  "UUID": "com.mikel-me.wienerlinien",
  "CodePath": "bin/plugin.js",
  "Nodejs": {
    "Version": "20",
    "Debug": "enabled"
  },
  "Actions": [
    {
      "UUID": "com.mikel-me.wienerlinien.departure",
      "Name": "Vienna - Wiener Linien Departure Board",
      "Icon": "imgs/actions/wienerlinien_departures/icon",
      "Tooltip": "Displays real-time departure information from Wiener Linien",
      "PropertyInspectorPath": "ui/departure-monitor.html",
      "Controllers": ["Keypad"],
      "States": [
        {
          "Image": "imgs/actions/wienerlinien_departures/icon",
          "TitleAlignment": "top",
          "FontSize": 14,
          "TitleColor": "#d0cd08",
          "ShowTitle": true
        }
      ]
    }
  ]
}
```

### Stream Deck CLI Commands

```bash
# Link plugin for development
streamdeck link <path-to-.sdPlugin>

# Restart plugin
streamdeck restart <plugin-uuid>

# Validate plugin
streamdeck validate <path-to-.sdPlugin>

# Create distribution package
streamdeck pack <path-to-.sdPlugin> [--force] [--output <path>]

# View plugin logs
streamdeck logs <plugin-uuid>
```

---

## Troubleshooting

### Build Errors

#### TypeScript Compilation Errors

**Problem:** TypeScript errors during `npm run build`

**Solution:**
- Check the error messages for specific file and line numbers
- Common issues:
  - Type mismatches: Ensure variables match their declared types
  - Missing imports: Add required import statements
  - Undefined properties: Check object structures match type definitions

#### Module Resolution Errors

**Problem:** `Cannot find module` errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Stream Deck CLI Errors

#### "Directory not found" when packing

**Problem:** `streamdeck pack` fails with "Directory not found"

**Solution:**
- Ensure you're in the correct directory (where `.sdPlugin` folder exists)
- Check the folder name matches exactly: `com.mikel-me.wienerlinien.sdPlugin`

#### "CodePath file not found"

**Problem:** Packing fails with "CodePath file not found, 'bin/plugin.js'"

**Solution:**
```bash
# Rebuild the plugin first
npm run build
# Then pack
streamdeck pack com.mikel-me.wienerlinien.sdPlugin --force
```

### Runtime Errors

#### Plugin not appearing in Stream Deck

**Problem:** Plugin installed but doesn't show up in Stream Deck

**Solution:**
1. Restart Stream Deck application completely
2. Check manifest.json is valid JSON (no syntax errors)
3. Verify UUID is unique and matches in all places

#### Plugin crashes or doesn't update

**Problem:** Plugin stops responding or doesn't reflect code changes

**Solution:**
```bash
# Restart the plugin
streamdeck restart com.mikel-me.wienerlinien

# Or rebuild and restart
npm run build
streamdeck restart com.mikel-me.wienerlinien
```

#### API not returning data

**Problem:** No departure information displayed

**Solution:**
- Check internet connection
- Verify RBL number is valid (Wiener Linien station ID)
- Check Stream Deck logs for API errors
- API endpoint: `https://www.wienerlinien.at/ogd_realtime/monitor`

### Watch Mode Issues

#### Watch mode not detecting changes

**Problem:** Files save but plugin doesn't rebuild

**Solution:**
- Stop watch mode (`Ctrl+C`)
- Restart: `npm run watch`
- Check file is in `src/` directory (only `src/**/*.ts` files are watched)

#### Watch mode restarts too frequently

**Problem:** Plugin restarts multiple times for one change

**Solution:**
- This is normal if you save multiple files quickly
- Wait for build to complete before saving next file

---

## Technical Reference

### Dependencies Explained

#### Runtime Dependencies

- **@elgato/streamdeck** (^1.0.0)
  - Official Stream Deck SDK for Node.js plugins
  - Provides APIs for button interactions, settings, images
  - Event-driven architecture

#### Development Dependencies

- **@elgato/cli** (^1.5.1)
  - Stream Deck command-line tools
  - Provides `streamdeck` commands for development

- **@rollup/plugin-typescript** (^12.1.0)
  - Compiles TypeScript to JavaScript during bundling
  - Integrates TypeScript compiler with Rollup

- **@rollup/plugin-node-resolve** (^15.2.2)
  - Resolves `node_modules` imports
  - Bundles third-party dependencies

- **@rollup/plugin-commonjs** (^28.0.0)
  - Converts CommonJS modules to ES modules
  - Required for some npm packages

- **@rollup/plugin-json** (^6.1.0)
  - Imports JSON files as modules
  - Used for configuration files

- **@rollup/plugin-terser** (^0.4.4)
  - Minifies JavaScript code
  - Reduces bundle size for production

- **rollup** (^4.0.2)
  - Module bundler for JavaScript
  - Combines multiple source files into single bundle

- **typescript** (^5.2.2)
  - TypeScript compiler
  - Provides type checking and modern JavaScript features

### SVG Rendering Architecture

The plugin uses **pure SVG rendering** instead of canvas:

**Benefits:**
- No native dependencies (no platform-specific binaries)
- Extremely lightweight package (~52 KB vs ~52 MB with canvas)
- Cross-platform compatible (Windows, macOS, Linux)
- Easy to maintain and debug

**Implementation:**
- `src/utils/svg-renderer.ts` contains all SVG generation functions
- Renders button states: departures, errors, loading, no data
- Uses `data:image/svg+xml` format for Stream Deck `setImage()` API
- Supports customizable colors, fonts, and text sizes

### API Integration

**Wiener Linien Real-time API:**
- Endpoint: `https://www.wienerlinien.at/ogd_realtime/monitor`
- Parameters:
  - `rbl` - Station identifier (required)
  - `activateTrafficInfo` - Include service alerts (optional)
- Response format: JSON
- Cache duration: 30 seconds (implemented in plugin)

### Version Numbering

Plugin uses **four-part versioning**: `MAJOR.MINOR.PATCH.BUILD`

Example: `0.5.0.0`
- **0** - Major version (pre-1.0 = beta)
- **5** - Minor version (new features)
- **0** - Patch version (bug fixes)
- **0** - Build number (reserved)

Update version in `manifest.json` before creating new package.

---

## Additional Resources

### Documentation

- **Stream Deck SDK Docs:** https://docs.elgato.com/sdk
- **Stream Deck CLI Docs:** https://docs.elgato.com/sdk/plugins/cli
- **Rollup Documentation:** https://rollupjs.org/
- **TypeScript Documentation:** https://www.typescriptlang.org/docs/

### Wiener Linien API

- **API Documentation:** https://www.data.gv.at/katalog/dataset/wiener-linien-echtzeitdaten-via-datendrehscheibe-wien
- **Open Data Portal:** https://www.data.gv.at/

### Community

- **Stream Deck Plugin Forums:** https://discord.gg/elgato
- **GitHub Issues:** Report bugs and request features in this repository

---

## Summary

### Development Workflow

1. `npm install` - Install dependencies (first time only)
2. `npm run watch` - Start development mode
3. Make changes in `src/` directory
4. Plugin automatically rebuilds and restarts
5. Test in Stream Deck

### Production Release

1. Update version in `manifest.json`
2. `npm run build` - Clean production build
3. `streamdeck pack com.mikel-me.wienerlinien.sdPlugin --force` - Create package
4. Distribute `.streamDeckPlugin` file

### Key Features

✅ Pure SVG rendering (no native dependencies)
✅ Lightweight package (~52 KB)
✅ Cross-platform compatible
✅ Real-time Vienna public transport data
✅ Customizable colors and text
✅ Advanced settings (text override, font sizes)
✅ Auto-refresh with configurable intervals
✅ Progress bar showing time until next refresh

---

**Plugin Version:** 0.5.0.0
**Last Updated:** 2025-11-30
