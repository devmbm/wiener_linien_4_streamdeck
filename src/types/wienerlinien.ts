/**
 * Type definitions for Wiener Linien Real-time Departures API
 * API Documentation: https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-echtzeitdaten-dokumentation.pdf
 */

export interface DepartureTime {
	/** Scheduled departure time in ISO 8601 format */
	timePlanned?: string;
	/** Real-time departure time in ISO 8601 format (may be null if real-time data unavailable) */
	timeReal?: string;
	/** Minutes until departure - THIS IS THE MOST RELIABLE FIELD */
	countdown: number;
}

export interface Departure {
	departureTime: DepartureTime;
}

export interface Line {
	/** Line identifier (e.g., "U1", "49", "26A", "N49") */
	name: string;
	/** Destination/direction of this line */
	towards: string;
	/** Direction code (may not always be present) */
	direction?: string;
	/** Platform identifier (e.g., "Steig 1") */
	platform: string;
	/** Internal direction identifier */
	richtungsId: string;
	/** Wheelchair accessible */
	barrierFree: boolean;
	/** Real-time data available for this line */
	realtimeSupported: boolean;
	/** Current traffic jam status */
	trafficjam: boolean;
	/** Vehicle type (e.g., "ptMetro", "ptTram", "ptBusCity", "ptBusNight") */
	type: string;
	/** Internal line identifier */
	lineId: number;
	/** Departure information */
	departures: {
		departure: Departure[];
	};
	/** Optional: This specific vehicle's destination if different from line's general destination */
	vehicle?: {
		towards: string;
	};
}

export interface LocationStop {
	type: string;
	geometry: {
		type: string;
		/** [longitude, latitude] in WGS84 format */
		coordinates: [number, number];
	};
	properties: {
		/** Internal stop identifier */
		name: string;
		/** Human-readable stop name */
		title: string;
		/** City name (usually "Wien") */
		municipality: string;
		/** Municipality identifier (90001 for Vienna) */
		municipalityId: number;
		/** Always "stop" */
		type: string;
		/** Coordinate system name ("WGS84") */
		coordName: string;
		attributes: {
			/** RBL number for this platform */
			rbl: number;
		};
	};
}

export interface Monitor {
	locationStop: LocationStop;
	lines: Line[];
	refTrafficInfoNames: string[];
}

export interface WienerLinienResponse {
	data: {
		monitors: Monitor[];
	};
	message: {
		value: string;
		messageCode: number;
		serverTime: string;
	};
}

/**
 * Simplified departure information for display
 */
export interface DepartureInfo {
	/** Line number (e.g., "26A", "U1") */
	line: string;
	/** Destination */
	towards: string;
	/** Minutes until departure */
	countdown: number;
	/** Platform */
	platform: string;
	/** Wheelchair accessible */
	barrierFree: boolean;
	/** Vehicle type */
	type: string;
}
