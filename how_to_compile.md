# How to Compile the Wiener Linien Stream Deck Plugin

This guide provides step-by-step instructions for compiling and packaging the Wiener Linien Stream Deck plugin. It includes both beginner-friendly instructions and technical details for advanced users and AI assistants.

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

# Install all platform-specific binaries (for multi-platform package)
npm install --force @napi-rs/canvas-darwin-x64 @napi-rs/canvas-darwin-arm64 @napi-rs/canvas-linux-x64-gnu

# Development mode (auto-rebuild and restart)
npm run watch

# Production build and package (multi-platform)
npm run build
rm -rf com.mikel-me.wienerlinien.sdPlugin/node_modules
mkdir -p com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs
cp -r node_modules/@napi-rs/canvas* com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs/
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
   cd c:/Users/mkbas/vibecode/streamdeck_wienerlinien/wienerlinien
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

This installs:
- Build tools (Rollup, TypeScript, plugins)
- Stream Deck SDK (`@elgato/streamdeck`)
- Native canvas library (`@napi-rs/canvas`)
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
   - Rollup monitors your source files
   - On save, it compiles TypeScript → JavaScript
   - Bundles everything into `com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js`
   - Attempts to restart the plugin (if it's linked to Stream Deck)

3. **First-time setup (if plugin not found):**
   ```bash
   # Link the plugin to Stream Deck for development
   streamdeck link com.mikel-me.wienerlinien.sdPlugin

   # Restart the plugin
   streamdeck restart com.mikel-me.wienerlinien
   ```

4. **Stop watch mode:**
   - Press `Ctrl+C` in the terminal

### Making Changes

1. Edit files in the `src/` directory:
   - `src/plugin.ts` - Main entry point
   - `src/actions/departure-monitor.ts` - Action logic
   - `src/api/wienerlinien-client.ts` - API integration

2. Save the file

3. Watch mode automatically rebuilds

4. Check Stream Deck to see your changes

---

## Production Build & Packaging

### Creating a Distribution Package

Follow these steps to create a `.streamDeckPlugin` file for distribution:

#### Step 1: Production Build

Stop watch mode (if running) and create a production build:

```bash
npm run build
```

**What this does:**
- Compiles TypeScript with production settings
- Minifies the code using Terser
- Removes source maps
- Creates optimized `bin/plugin.js` (~82 KB)

#### Step 2: Install Multi-Platform Binaries (First Time Only)

For a universal package that works on all platforms, install all platform-specific binaries:

```bash
npm install --force @napi-rs/canvas-darwin-x64 @napi-rs/canvas-darwin-arm64 @napi-rs/canvas-linux-x64-gnu
```

**Platforms supported:**
- Windows 64-bit (`canvas-win32-x64-msvc`) - Installed by default
- macOS Intel (`canvas-darwin-x64`) - Needs manual install
- macOS Apple Silicon (`canvas-darwin-arm64`) - Needs manual install
- Linux 64-bit (`canvas-linux-x64-gnu`) - Needs manual install

**Note:** The `--force` flag is required because npm normally only installs binaries for your current platform.

#### Step 3: Copy Native Dependencies

Copy ALL platform binaries to the plugin folder:

```bash
rm -rf com.mikel-me.wienerlinien.sdPlugin/node_modules
mkdir -p com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs
cp -r node_modules/@napi-rs/canvas* com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs/
```

**Why this is needed:**
- Rollup cannot bundle native Node.js modules
- The canvas library uses native C++ bindings compiled for each platform
- These files must be present at runtime
- Files copied (all platforms):
  - `@napi-rs/canvas` - JavaScript wrapper (shared)
  - `@napi-rs/canvas-win32-x64-msvc` - Windows binary (~25 MB)
  - `@napi-rs/canvas-darwin-x64` - macOS Intel binary (~30 MB)
  - `@napi-rs/canvas-darwin-arm64` - macOS ARM binary (~25 MB)
  - `@napi-rs/canvas-linux-x64-gnu` - Linux binary (~31 MB)

#### Step 4: Create Package

```bash
streamdeck pack com.mikel-me.wienerlinien.sdPlugin --force
```

**Output:**
- File: `com.mikel-me.wienerlinien.streamDeckPlugin`
- Size: ~52 MB (universal multi-platform package)
- Location: Current directory

**Package contents:**
- `manifest.json` - Plugin metadata
- `bin/plugin.js` - Compiled and minified code (~277 KB)
- `node_modules/@napi-rs/canvas/` - JavaScript wrapper (shared)
- `node_modules/@napi-rs/canvas-win32-x64-msvc/` - Windows binary (~25 MB)
- `node_modules/@napi-rs/canvas-darwin-x64/` - macOS Intel binary (~30 MB)
- `node_modules/@napi-rs/canvas-darwin-arm64/` - macOS ARM binary (~25 MB)
- `node_modules/@napi-rs/canvas-linux-x64-gnu/` - Linux binary (~31 MB)
- `ui/` - HTML configuration interface
- `imgs/` - Icons and images

**Platform Support:**
- ✅ Windows 10/11 (64-bit)
- ✅ macOS 12+ (Intel)
- ✅ macOS 12+ (Apple Silicon M1/M2/M3)
- ✅ Linux (64-bit)

#### Step 5: Verify the Package

Check the package was created:

```bash
ls -lh com.mikel-me.wienerlinien.streamDeckPlugin
```

You should see a file around 52 MB in size (universal package with all platforms).

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
│   └── types/
│       └── wienerlinien.ts               # Type definitions
│
├── com.mikel-me.wienerlinien.sdPlugin/   # PLUGIN BUNDLE
│   ├── manifest.json                      # Plugin metadata
│   ├── bin/
│   │   ├── plugin.js                     # COMPILED OUTPUT
│   │   ├── plugin.js.map                 # Source map (dev only)
│   │   └── package.json                  # ES module marker
│   ├── node_modules/                      # Native dependencies (for package)
│   │   └── @napi-rs/
│   │       ├── canvas/                   # Canvas JS wrapper
│   │       └── canvas-win32-x64-msvc/    # Native binary
│   ├── ui/
│   │   └── departure-monitor.html        # Settings UI
│   └── imgs/                              # Icons
│
├── package.json                           # Build scripts & dependencies
├── tsconfig.json                          # TypeScript config
├── rollup.config.mjs                      # Build configuration
└── com.mikel-me.wienerlinien.streamDeckPlugin  # DISTRIBUTION (ZIP)
```

### Build Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Source Files (src/*.ts)                                  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Rollup + TypeScript Plugin                              │
│    - Compiles TypeScript → JavaScript                      │
│    - Bundles all imports                                    │
│    - Resolves dependencies from node_modules               │
│    - Excludes @napi-rs/canvas (marked as external)         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. JavaScript Bundle (bin/plugin.js)                       │
│    - Watch mode: ~277 KB (unminified, with source maps)   │
│    - Production: ~82 KB (minified, no source maps)         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Add Native Dependencies (manual step)                   │
│    - Copy @napi-rs/canvas to .sdPlugin/node_modules/       │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Stream Deck CLI (streamdeck pack)                       │
│    - Validates manifest.json                                │
│    - Creates ZIP archive                                    │
│    - Renames to .streamDeckPlugin                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Distribution Package (.streamDeckPlugin)                │
│    - Size: ~52 MB (universal, all platforms)              │
│    - Ready for installation on any supported platform      │
└─────────────────────────────────────────────────────────────┘
```

### Key Differences: Watch vs Production

| Aspect | Watch Mode (`npm run watch`) | Production (`npm run build`) |
|--------|------------------------------|------------------------------|
| **Minification** | No (readable code) | Yes (using Terser) |
| **Source Maps** | Yes (for debugging) | No |
| **File Size** | ~277 KB | ~82 KB |
| **Auto-restart** | Yes | No |
| **Use Case** | Development/testing | Distribution |

### Why Native Dependencies Matter

The `@napi-rs/canvas` library is special:

1. **Native Module**: Written in Rust, compiled to native code
2. **Cannot be Bundled**: Rollup cannot include binary files
3. **Runtime Requirement**: Must be available when plugin executes
4. **Platform Specific**: Different binaries for Windows/Mac/Linux

**In `rollup.config.mjs`:**
```javascript
external: ["@napi-rs/canvas"]  // Don't try to bundle this
```

**This means:**
- The import statement remains in compiled code
- Stream Deck's Node.js runtime resolves it at runtime
- We must manually include it in the package

---

## Troubleshooting

### Problem: "Plugin not found" error

**Symptom:**
```
✖️ Restarting failed
Plugin not found: com.mikel-me.wienerlinien
```

**Solution:**
Link the plugin first:
```bash
streamdeck link com.mikel-me.wienerlinien.sdPlugin
streamdeck restart com.mikel-me.wienerlinien
```

---

### Problem: Package installs but doesn't work

**Symptom:**
- Plugin shows only icon on button
- No departure data displays
- Works in watch mode but not when packaged

**Cause:**
Native dependencies not included in package.

**Solution:**
Ensure you copied native modules before packaging:
```bash
# Check if node_modules exists in .sdPlugin
ls com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs/

# If not, copy them:
mkdir -p com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs
cp -r node_modules/@napi-rs/canvas* com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs/

# Repackage
streamdeck pack com.mikel-me.wienerlinien.sdPlugin --force
```

---

### Problem: Build fails with TypeScript errors

**Symptom:**
```
error TS18048: 'settings' is possibly 'undefined'.
```

**Note:**
These are warnings, not errors. The build still succeeds. The code includes runtime checks for undefined values.

**To suppress (optional):**
Add `// @ts-ignore` before the line, but this is not recommended as the code handles it correctly.

---

### Problem: "CodePath file not found" during packaging

**Symptom:**
```
28:14  error    CodePath file not found, 'bin/plugin.js'
```

**Cause:**
The `plugin.js` file doesn't exist or watch mode is interfering.

**Solution:**
1. Stop watch mode (Ctrl+C)
2. Run production build:
   ```bash
   npm run build
   ```
3. Try packaging again

---

### Problem: Package is too small (< 10 MB)

**Symptom:**
Package is only ~300 KB instead of ~52 MB (universal) or ~35 MB (single platform).

**Cause:**
Native dependencies not included.

**Check:**
```bash
unzip -l com.mikel-me.wienerlinien.streamDeckPlugin | grep node_modules
```

If empty, native modules are missing. Follow Steps 2-3 in [Production Build & Packaging](#production-build--packaging).

---

### Problem: Plugin works on Windows but not on macOS/Linux

**Symptom:**
- Plugin shows icon but no data on macOS or Linux
- Works fine on Windows
- No logs generated on the other platform

**Cause:**
Only Windows binaries were included in the package.

**Solution:**
Create a universal package with all platform binaries:

```bash
# Install all platform binaries
npm install --force @napi-rs/canvas-darwin-x64 @napi-rs/canvas-darwin-arm64 @napi-rs/canvas-linux-x64-gnu

# Rebuild with all platforms
rm -rf com.mikel-me.wienerlinien.sdPlugin/node_modules
mkdir -p com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs
cp -r node_modules/@napi-rs/canvas* com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs/

# Repackage
streamdeck pack com.mikel-me.wienerlinien.sdPlugin --force
```

**Verify all platforms are included:**
```bash
unzip -l com.mikel-me.wienerlinien.streamDeckPlugin | grep "skia\."
```

Should show:
- `skia.win32-x64-msvc.node` (Windows)
- `skia.darwin-x64.node` (macOS Intel)
- `skia.darwin-arm64.node` (macOS Apple Silicon)
- `skia.linux-x64-gnu.node` (Linux)

---

### Problem: macOS says "damaged" or can't verify developer

**Symptom:**
macOS prevents installation with "damaged" or "unidentified developer" message.

**Solution:**
```bash
# On macOS, after installing the plugin:
xattr -cr ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/com.mikel-me.wienerlinien.sdPlugin
```

---

## Technical Reference

### Configuration Files

#### `package.json`

Defines build scripts and dependencies:

```json
{
  "name": "com.mikel-me.wienerlinien",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w --watch.onEnd=\"streamdeck restart com.mikel-me.wienerlinien\""
  },
  "dependencies": {
    "@elgato/streamdeck": "^1.0.0",
    "@napi-rs/canvas": "^0.1.59"
  },
  "devDependencies": {
    "@elgato/cli": "^1.0.0",
    "rollup": "^4.0.0",
    "typescript": "^5.0.0",
    // ... Rollup plugins
  }
}
```

#### `rollup.config.mjs`

Configures the build process:

```javascript
export default {
  input: "src/plugin.ts",
  output: {
    file: "com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js",
    sourcemap: isWatching,  // Only in watch mode
    format: "esm"
  },
  external: ["@napi-rs/canvas"],  // Don't bundle native module
  plugins: [
    typescript(),        // Compile TypeScript
    json(),             // Import JSON files
    nodeResolve(),      // Resolve node_modules
    commonjs(),         // Convert CommonJS to ESM
    !isWatching && terser()  // Minify in production
  ]
}
```

#### `tsconfig.json`

TypeScript compiler settings:

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
  "Version": "0.1.0.0",
  "UUID": "com.mikel-me.wienerlinien",
  "CodePath": "bin/plugin.js",
  "Nodejs": {
    "Version": "20",
    "Debug": "enabled"
  },
  "Actions": [
    {
      "UUID": "com.mikel-me.wienerlinien.departures",
      "Name": "Departure Monitor",
      // ... action configuration
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

# Enable developer mode (for debugging)
streamdeck dev

# List installed plugins
streamdeck list
```

### File Locations

**Development:**
- Source: `src/`
- Compiled output: `com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js`
- Logs: `com.mikel-me.wienerlinien.sdPlugin/logs/`

**Installed Plugin (Windows):**
- `%APPDATA%\Elgato\StreamDeck\Plugins\com.mikel-me.wienerlinien.sdPlugin\`

**Distribution:**
- `com.mikel-me.wienerlinien.streamDeckPlugin` (ZIP archive)

---

## Best Practices

### Development

1. **Use watch mode** for active development
2. **Check logs** if issues occur: `com.mikel-me.wienerlinien.sdPlugin/logs/`
3. **Test frequently** in actual Stream Deck
4. **Use browser DevTools** when debugging UI: http://localhost:23654/

### Production

1. **Always run `npm run build`** before packaging
2. **Always copy native dependencies** to .sdPlugin folder
3. **Test packaged version** before distributing
4. **Keep packages small** by excluding unnecessary files
5. **Document dependencies** clearly

### Version Control

**Include in Git:**
- `src/`
- `package.json`
- `rollup.config.mjs`
- `tsconfig.json`
- `manifest.json` (in .sdPlugin)
- `ui/` and `imgs/` folders

**Exclude from Git (.gitignore):**
- `node_modules/`
- `com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js`
- `com.mikel-me.wienerlinien.sdPlugin/bin/plugin.js.map`
- `com.mikel-me.wienerlinien.sdPlugin/node_modules/`
- `com.mikel-me.wienerlinien.sdPlugin/logs/`
- `*.streamDeckPlugin`

---

## Summary

### For Quick Reference

**Development:**
```bash
npm install              # First time only
npm run watch            # Development mode
streamdeck link com.mikel-me.wienerlinien.sdPlugin  # First time only
```

**Production:**
```bash
npm run build
mkdir -p com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs
cp -r node_modules/@napi-rs/canvas* com.mikel-me.wienerlinien.sdPlugin/node_modules/@napi-rs/
streamdeck pack com.mikel-me.wienerlinien.sdPlugin --force
```

### Key Points for AI Assistants

1. **Native Dependencies**: The `@napi-rs/canvas` module MUST be manually copied to the .sdPlugin folder before packaging
2. **Two Build Modes**: Watch (development) vs Production (distribution) have different outputs
3. **Rollup Configuration**: External modules are not bundled but must be available at runtime
4. **Stream Deck CLI**: Essential for linking, validating, and packaging plugins
5. **Node.js 20**: Required by Stream Deck's embedded runtime

---

## Additional Resources

- **Stream Deck SDK Documentation**: https://docs.elgato.com/sdk
- **Stream Deck CLI**: https://docs.elgato.com/sdk/plugins/cli
- **Rollup Documentation**: https://rollupjs.org/
- **TypeScript Documentation**: https://www.typescriptlang.org/
- **@napi-rs/canvas**: https://github.com/Brooooooklyn/canvas

---

**Last Updated**: November 13, 2025
**Plugin Version**: 0.1.0.0
**Tested On**: Windows 10/11, Stream Deck Software 6.x
