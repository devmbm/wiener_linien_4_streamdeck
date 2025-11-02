# Wiener Linien Real-Time Departures API Documentation

## Overview

The **Wiener Linien Echtzeitdaten API** provides free, real-time public transport departure information for Vienna's public transportation network (U-Bahn, trams, buses). This API is part of Vienna's Open Government Data initiative and is available under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.

**Key Features:**
- No API key required (as of recent updates)
- Free to use
- Real-time departure data
- Traffic disruption information
- 70-minute lookahead for departures
- JSON response format

---

## Base Endpoint

```
https://www.wienerlinien.at/ogd_realtime/monitor
```

**Method:** GET

---

## Understanding RBL Numbers

**RBL (Rechnergestütztes Betriebsleitsystem)** numbers are unique identifiers for each platform/direction at a transit stop. Each platform at a stop has its own RBL number.

**Example:**
- Karlsplatz U-Bahn station has multiple RBL numbers:
  - One for U1 direction Leopoldau
  - One for U1 direction Oberlaa
  - One for U2 direction Seestadt
  - One for U4 direction Hütteldorf
  - etc.

### Finding RBL Numbers

**Option 1: Online RBL Search Tool**
- Visit: https://till.mabe.at/rbl/
- Search by station name, line, or direction
- Get the RBL number for your desired stop/direction

**Option 2: Download Official CSV Files**
- Haltestellen (Stops): `wienerlinien-ogd-haltestellen.csv`
- Steige (Platforms): `wienerlinien-ogd-steige.csv`
- Available at: https://www.data.gv.at/katalog/dataset/wiener-linien-echtzeitdaten-via-datendrehscheibe-wien

**Option 3: CSV Description Document**
- Official documentation: https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien_ogd_Beschreibung.pdf

---

## API Request Parameters

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `rbl` | integer | RBL number of the platform/stop | `rbl=4259` |

### Optional Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `sender` | string | Sender ID for authentication (optional, not required anymore) | `sender=YourAppName` |
| `activateTrafficInfo` | string | Activate traffic disruption info (can be specified multiple times) | See below |

### Traffic Info Options

The `activateTrafficInfo` parameter accepts these values:
- `stoerungkurz` - Short disruption messages
- `stoerunglang` - Long/detailed disruption messages
- `aufzugsinfo` - Elevator status information

You can include multiple `activateTrafficInfo` parameters in one request.

---

## Example Requests

### Single RBL Number (Basic)

```
https://www.wienerlinien.at/ogd_realtime/monitor?rbl=4259
```

### Single RBL with Traffic Info

```
https://www.wienerlinien.at/ogd_realtime/monitor?rbl=1450&activateTrafficInfo=stoerungkurz&activateTrafficInfo=stoerunglang&activateTrafficInfo=aufzugsinfo
```

### Multiple RBL Numbers

```
https://www.wienerlinien.at/ogd_realtime/monitor?rbl=4635&rbl=4634&rbl=1450
```

### With Sender ID (Optional)

```
https://www.wienerlinien.at/ogd_realtime/monitor?rbl=4259&sender=MyStreamDeckPlugin
```

---

## Response Format

### Request Headers

When making requests, include these headers:
```
Accept: application/json
Content-Type: application/json
```

### Response Structure

The API returns JSON with the following structure:

```json
{
  "data": {
    "monitors": [
      {
        "locationStop": {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [16.3725, 48.2083]
          },
          "properties": {
            "name": "60201450",
            "title": "Hütteldorfer Straße",
            "municipality": "Wien",
            "municipalityId": 90001,
            "type": "stop",
            "coordName": "WGS84",
            "attributes": {
              "rbl": 1450
            }
          }
        },
        "lines": [
          {
            "name": "N49",
            "towards": "Hütteldorf",
            "direction": "H",
            "platform": "Steig 1",
            "richtungsId": "1",
            "barrierFree": true,
            "realtimeSupported": true,
            "trafficjam": false,
            "departures": {
              "departure": [
                {
                  "departureTime": {
                    "timePlanned": "2025-01-15T14:30:00.000+01:00",
                    "timeReal": "2025-01-15T14:32:00.000+01:00",
                    "countdown": 5
                  }
                },
                {
                  "departureTime": {
                    "timePlanned": "2025-01-15T14:45:00.000+01:00",
                    "timeReal": "2025-01-15T14:45:00.000+01:00",
                    "countdown": 20
                  }
                }
              ]
            },
            "type": "ptBusNight",
            "lineId": 301
          }
        ],
        "refTrafficInfoNames": []
      }
    ]
  },
  "message": {
    "value": "OK",
    "messageCode": 1,
    "serverTime": "2025-01-15T14:27:30.123+01:00"
  }
}
```

---

## Response Field Descriptions

### Top Level

| Field | Type | Description |
|-------|------|-------------|
| `data` | object | Contains the monitors array with departure data |
| `message` | object | API response metadata and server time |

### data.monitors[] Array

Each monitor represents a stop/platform:

#### locationStop Object

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always "Feature" (GeoJSON format) |
| `geometry.type` | string | Always "Point" |
| `geometry.coordinates` | array | `[longitude, latitude]` in WGS84 format |
| `properties.name` | string | Internal stop identifier |
| `properties.title` | string | Human-readable stop name |
| `properties.municipality` | string | City name (usually "Wien") |
| `properties.municipalityId` | integer | Municipality identifier (90001 for Vienna) |
| `properties.type` | string | Always "stop" |
| `properties.coordName` | string | Coordinate system name ("WGS84") |
| `properties.attributes.rbl` | integer | RBL number for this platform |

#### lines[] Array

Each line object represents a transit line serving this platform:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Line identifier (e.g., "U1", "49", "N49") |
| `towards` | string | Destination/direction of this line |
| `direction` | string | Direction code (may not always be present) |
| `platform` | string | Platform identifier (e.g., "Steig 1") |
| `richtungsId` | string | Internal direction identifier |
| `barrierFree` | boolean | Wheelchair accessible |
| `realtimeSupported` | boolean | Real-time data available for this line |
| `trafficjam` | boolean | Current traffic jam status |
| `type` | string | Vehicle type (e.g., "ptMetro", "ptTram", "ptBusCity", "ptBusNight") |
| `lineId` | integer | Internal line identifier |
| `departures.departure` | array | Array of upcoming departures |

**Vehicle Types:**
- `ptMetro` - U-Bahn (Metro)
- `ptTram` - Straßenbahn (Tram)
- `ptBusCity` - Autobus (City Bus)
- `ptBusNight` - Nightline Bus

#### departures.departure[] Array

Each departure object:

| Field | Type | Description |
|-------|------|-------------|
| `departureTime.timePlanned` | string | Scheduled departure (ISO 8601 format) |
| `departureTime.timeReal` | string | Real-time departure (ISO 8601 format, may be null) |
| `departureTime.countdown` | integer | Minutes until departure |

**Important Notes:**
- `timeReal` may not exist if real-time data is unavailable
- `timePlanned` might be undefined if the departure time is only in the `towards` string
- **Always use the `countdown` field** for reliable departure timing
- The API returns departures for the next 70 minutes

#### vehicle Object (Optional)

May appear when the vehicle's destination differs from the line's general destination:

| Field | Type | Description |
|-------|------|-------------|
| `vehicle.towards` | string | This specific vehicle's destination |

---

## Code Examples

### JavaScript/TypeScript (Fetch API)

```javascript
async function getWienerLinienDepartures(rblNumber) {
  const url = `https://www.wienerlinien.at/ogd_realtime/monitor?rbl=${rblNumber}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Usage example
getWienerLinienDepartures(4259)
  .then(data => {
    const monitors = data.data.monitors;

    monitors.forEach(monitor => {
      const stopName = monitor.locationStop.properties.title;
      console.log(`Stop: ${stopName}`);

      monitor.lines.forEach(line => {
        console.log(`\n  Line ${line.name} towards ${line.towards}:`);

        line.departures.departure.forEach(dep => {
          const countdown = dep.departureTime.countdown;
          console.log(`    - in ${countdown} minutes`);
        });
      });
    });
  })
  .catch(error => console.error('Error:', error));
```

### TypeScript with Type Definitions

```typescript
interface DepartureTime {
  timePlanned?: string;
  timeReal?: string;
  countdown: number;
}

interface Departure {
  departureTime: DepartureTime;
}

interface Line {
  name: string;
  towards: string;
  direction?: string;
  platform: string;
  richtungsId: string;
  barrierFree: boolean;
  realtimeSupported: boolean;
  trafficjam: boolean;
  type: string;
  lineId: number;
  departures: {
    departure: Departure[];
  };
  vehicle?: {
    towards: string;
  };
}

interface LocationStop {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    name: string;
    title: string;
    municipality: string;
    municipalityId: number;
    type: string;
    coordName: string;
    attributes: {
      rbl: number;
    };
  };
}

interface Monitor {
  locationStop: LocationStop;
  lines: Line[];
  refTrafficInfoNames: string[];
}

interface WienerLinienResponse {
  data: {
    monitors: Monitor[];
  };
  message: {
    value: string;
    messageCode: number;
    serverTime: string;
  };
}

async function getDepartures(rblNumber: number): Promise<WienerLinienResponse> {
  const url = `https://www.wienerlinien.at/ogd_realtime/monitor?rbl=${rblNumber}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

// Usage
async function displayNextDepartures(rblNumber: number) {
  try {
    const data = await getDepartures(rblNumber);

    data.data.monitors.forEach(monitor => {
      const stopName = monitor.locationStop.properties.title;

      monitor.lines.forEach(line => {
        const nextDepartures = line.departures.departure
          .slice(0, 3) // Get next 3 departures
          .map(dep => `${dep.departureTime.countdown} min`)
          .join(', ');

        console.log(`${line.name} to ${line.towards}: ${nextDepartures}`);
      });
    });
  } catch (error) {
    console.error('Failed to fetch departures:', error);
  }
}
```

### Node.js Example with Error Handling

```javascript
const https = require('https');

function getWienerLinienDepartures(rblNumbers, options = {}) {
  return new Promise((resolve, reject) => {
    // Build query string
    const rblParams = Array.isArray(rblNumbers)
      ? rblNumbers.map(rbl => `rbl=${rbl}`).join('&')
      : `rbl=${rblNumbers}`;

    const trafficInfo = options.includeTrafficInfo
      ? '&activateTrafficInfo=stoerungkurz&activateTrafficInfo=stoerunglang'
      : '';

    const sender = options.sender ? `&sender=${options.sender}` : '';

    const url = `https://www.wienerlinien.at/ogd_realtime/monitor?${rblParams}${trafficInfo}${sender}`;

    https.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Usage examples
getWienerLinienDepartures(4259)
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Multiple RBLs with traffic info
getWienerLinienDepartures([4259, 4634], {
  includeTrafficInfo: true,
  sender: 'StreamDeckPlugin'
})
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

---

## Best Practices

### 1. Caching
- Cache responses for at least 30-60 seconds to reduce API load
- The departure data updates in real-time but doesn't need second-by-second polling

### 2. Error Handling
```javascript
async function fetchWithRetry(rbl, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`https://www.wienerlinien.at/ogd_realtime/monitor?rbl=${rbl}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
```

### 3. Data Validation
```javascript
function validateMonitorData(data) {
  if (!data?.data?.monitors || !Array.isArray(data.data.monitors)) {
    throw new Error('Invalid API response structure');
  }

  if (data.data.monitors.length === 0) {
    throw new Error('No monitors found for this RBL');
  }

  return true;
}
```

### 4. Handling Missing Real-time Data
```javascript
function getDepartureTime(departure) {
  // Always prefer countdown as it's the most reliable
  if (departure.departureTime.countdown !== undefined) {
    return {
      countdown: departure.departureTime.countdown,
      isRealtime: departure.departureTime.timeReal !== null
    };
  }

  // Fallback to calculating from timestamps
  const timeToUse = departure.departureTime.timeReal || departure.departureTime.timePlanned;
  if (timeToUse) {
    const now = new Date();
    const departureTime = new Date(timeToUse);
    const minutesUntil = Math.floor((departureTime - now) / 60000);

    return {
      countdown: minutesUntil,
      isRealtime: departure.departureTime.timeReal !== null
    };
  }

  return null;
}
```

### 5. Filtering and Sorting
```javascript
function getNextDepartures(monitor, lineName = null, maxCount = 5) {
  let lines = monitor.lines;

  // Filter by line if specified
  if (lineName) {
    lines = lines.filter(line => line.name === lineName);
  }

  // Get all departures and flatten
  const allDepartures = lines.flatMap(line =>
    line.departures.departure.map(dep => ({
      line: line.name,
      towards: line.towards,
      countdown: dep.departureTime.countdown,
      platform: line.platform,
      barrierFree: line.barrierFree
    }))
  );

  // Sort by countdown and limit
  return allDepartures
    .sort((a, b) => a.countdown - b.countdown)
    .slice(0, maxCount);
}
```

---

## Common Use Cases

### Display Next 3 Departures for a Stop

```javascript
async function getNext3Departures(rbl) {
  const data = await fetch(`https://www.wienerlinien.at/ogd_realtime/monitor?rbl=${rbl}`)
    .then(r => r.json());

  const monitor = data.data.monitors[0];
  const departures = [];

  monitor.lines.forEach(line => {
    line.departures.departure.forEach(dep => {
      departures.push({
        line: line.name,
        towards: line.towards,
        countdown: dep.departureTime.countdown
      });
    });
  });

  // Sort by countdown and take first 3
  return departures
    .sort((a, b) => a.countdown - b.countdown)
    .slice(0, 3);
}
```

### Monitor Specific Line at a Stop

```javascript
async function getLineAtStop(rbl, lineName) {
  const data = await fetch(`https://www.wienerlinien.at/ogd_realtime/monitor?rbl=${rbl}`)
    .then(r => r.json());

  const monitor = data.data.monitors[0];
  const line = monitor.lines.find(l => l.name === lineName);

  if (!line) {
    return null;
  }

  return {
    line: line.name,
    towards: line.towards,
    nextDepartures: line.departures.departure.map(d => d.departureTime.countdown)
  };
}
```

### Check for Service Disruptions

```javascript
async function hasDisruptions(rbl) {
  const url = `https://www.wienerlinien.at/ogd_realtime/monitor?rbl=${rbl}&activateTrafficInfo=stoerunglang`;
  const data = await fetch(url).then(r => r.json());

  const monitor = data.data.monitors[0];
  return monitor.refTrafficInfoNames.length > 0;
}
```

---

## Rate Limiting

While the API doesn't enforce strict rate limits, it's recommended to:
- **Limit requests to one every 30-60 seconds** per RBL
- Cache responses appropriately
- Batch multiple RBL requests into a single API call when possible
- Be respectful of the free public service

---

## Troubleshooting

### Empty monitors Array
**Problem:** `data.data.monitors` is empty
**Solution:**
- Verify the RBL number is correct
- Check if the RBL number is still active (some may be deprecated)
- Use the RBL search tool to find valid RBL numbers

### Missing timeReal Field
**Problem:** `timeReal` is null or undefined
**Solution:**
- This is normal when real-time data is unavailable
- Always rely on the `countdown` field, which is always present
- Check `realtimeSupported` field to know if real-time is expected

### No Departures in Next 70 Minutes
**Problem:** `departures.departure` array is empty
**Solution:**
- This can happen during late night hours or for infrequent lines
- The API only returns departures within the next 70 minutes
- Check the schedule or use a different RBL/line

### CORS Errors (Browser)
**Problem:** CORS errors when calling from browser
**Solution:**
- Make requests from a backend/server
- Use a proxy server
- For Stream Deck plugins, requests are made from Node.js runtime (no CORS issues)

---

## Resources

### Official Documentation
- **API Documentation PDF:** https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-echtzeitdaten-dokumentation.pdf
- **OGD File Description:** https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien_ogd_Beschreibung.pdf
- **Open Data Portal:** https://www.data.gv.at/katalog/dataset/wiener-linien-echtzeitdaten-via-datendrehscheibe-wien
- **Wiener Linien Open Data:** https://www.wienerlinien.at/open-data

### Tools
- **RBL Search Tool:** https://till.mabe.at/rbl/
- **Alternative API Wrapper:** https://vtapi.floscodes.net/docs/

### Code Examples
- **GitHub Topic:** https://github.com/topics/wiener-linien
- **Öffimonitor Project:** https://github.com/Metalab/oeffimonitor
- **Node.js Library:** https://github.com/ulrichformann/wienerlinien
- **.NET Wrapper:** https://github.com/KarimDarwish/WienerLinien.NET

### Community Resources
- **Errata/Updates:** https://f59.at/errata/
- **Vienna Transport API:** https://vtapi.floscodes.net/

---

## License

The Wiener Linien Echtzeitdaten API is provided under:

**Creative Commons Attribution 4.0 International (CC BY 4.0)**

You are free to:
- Use the data commercially
- Modify and build upon the data
- Share the data

Under the condition that:
- You provide appropriate attribution to Wiener Linien / Stadt Wien

**Recommended Attribution:**
```
Data source: Wiener Linien / Stadt Wien - data.wien.gv.at
Licensed under CC BY 4.0
```

---

## Quick Reference

### Minimal Example
```javascript
// Get departures for RBL 4259
fetch('https://www.wienerlinien.at/ogd_realtime/monitor?rbl=4259')
  .then(r => r.json())
  .then(data => {
    const monitor = data.data.monitors[0];
    monitor.lines.forEach(line => {
      console.log(`${line.name} to ${line.towards}: ${line.departures.departure[0].departureTime.countdown} min`);
    });
  });
```

### Most Important Fields
- `data.data.monitors[0].locationStop.properties.title` - Stop name
- `data.data.monitors[0].lines[i].name` - Line number
- `data.data.monitors[0].lines[i].towards` - Destination
- `data.data.monitors[0].lines[i].departures.departure[j].departureTime.countdown` - Minutes until departure

---

**Last Updated:** January 2025
**API Version:** 1.3
**Documentation Created for:** Stream Deck Plugin Development
