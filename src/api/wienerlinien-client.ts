import streamDeck from "@elgato/streamdeck";
import type { DepartureInfo, WienerLinienResponse } from "../types/wienerlinien";

/**
 * Client for fetching real-time departure data from Wiener Linien API
 * API Endpoint: https://www.wienerlinien.at/ogd_realtime/monitor
 * License: CC BY 4.0 - Free to use with attribution
 */
export class WienerLinienClient {
	private static readonly API_BASE = "https://www.wienerlinien.at/ogd_realtime/monitor";
	private static readonly CACHE_DURATION = 30000; // 30 seconds cache
	private cache = new Map<number, { data: DepartureInfo[]; timestamp: number }>();

	/**
	 * Fetch real-time departures for a given RBL number
	 * @param rblNumber The RBL (Rechnergestütztes Betriebsleitsystem) number of the platform/stop
	 * @param maxDepartures Maximum number of departures to return (default: 5)
	 * @returns Array of departure information sorted by countdown
	 */
	async getDepartures(rblNumber: number, maxDepartures: number = 5): Promise<DepartureInfo[]> {
		// Check cache first
		const cached = this.cache.get(rblNumber);
		if (cached && Date.now() - cached.timestamp < WienerLinienClient.CACHE_DURATION) {
			streamDeck.logger.debug(`Using cached data for RBL ${rblNumber}`);
			return cached.data.slice(0, maxDepartures);
		}

		try {
			const url = `${WienerLinienClient.API_BASE}?rbl=${rblNumber}`;
			streamDeck.logger.info(`Fetching departures from: ${url}`);

			const response = await fetch(url, {
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				}
			});

			streamDeck.logger.debug(`API response status: ${response.status} ${response.statusText}`);

			if (!response.ok) {
				const errorText = await response.text();
				streamDeck.logger.error(`API error response: ${errorText}`);
				throw new Error(`API request failed: ${response.status} ${response.statusText}`);
			}

			const responseText = await response.text();
			streamDeck.logger.debug(`API response length: ${responseText.length} bytes`);

			let data: WienerLinienResponse;
			try {
				data = JSON.parse(responseText) as WienerLinienResponse;
			} catch (parseError) {
				streamDeck.logger.error(`Failed to parse JSON response: ${parseError}`);
				streamDeck.logger.error(`Response text: ${responseText.substring(0, 500)}`);
				throw new Error(`Invalid JSON response from API`);
			}

			// Validate response
			if (!data?.data?.monitors || data.data.monitors.length === 0) {
				streamDeck.logger.warn(`No monitors found in API response for RBL ${rblNumber}`);
				streamDeck.logger.debug(`Response structure: ${JSON.stringify(data).substring(0, 500)}`);
				throw new Error(`No monitors found for RBL ${rblNumber}. Please verify the RBL number is correct.`);
			}

			// Extract and flatten all departures
			const departures = this.extractDepartures(data);

			// Cache the results
			this.cache.set(rblNumber, {
				data: departures,
				timestamp: Date.now()
			});

			streamDeck.logger.info(`Successfully fetched ${departures.length} departures for RBL ${rblNumber}`);
			return departures.slice(0, maxDepartures);
		} catch (error: any) {
			const errorMessage = error?.message || String(error);
			streamDeck.logger.error(`Failed to fetch departures for RBL ${rblNumber}: ${errorMessage}`);
			if (error?.stack) {
				streamDeck.logger.error(`Error stack: ${error.stack}`);
			}
			throw error;
		}
	}

	/**
	 * Get the next single departure for display on Stream Deck
	 * @param rblNumber The RBL number of the platform/stop
	 * @returns The next departure or null if none available
	 */
	async getNextDeparture(rblNumber: number): Promise<DepartureInfo | null> {
		const departures = await this.getDepartures(rblNumber, 1);
		return departures.length > 0 ? departures[0] : null;
	}

	/**
	 * Extract and flatten departure information from API response
	 */
	private extractDepartures(response: WienerLinienResponse): DepartureInfo[] {
		const allDepartures: DepartureInfo[] = [];

		for (const monitor of response.data.monitors) {
			for (const line of monitor.lines) {
				for (const dep of line.departures.departure) {
					allDepartures.push({
						line: line.name,
						towards: line.towards,
						countdown: dep.departureTime.countdown,
						platform: line.platform,
						barrierFree: line.barrierFree,
						type: line.type
					});
				}
			}
		}

		// Sort by countdown (soonest first)
		return allDepartures.sort((a, b) => a.countdown - b.countdown);
	}

	/**
	 * Clear the cache for a specific RBL number or all cached data
	 */
	clearCache(rblNumber?: number): void {
		if (rblNumber !== undefined) {
			this.cache.delete(rblNumber);
			streamDeck.logger.debug(`Cleared cache for RBL ${rblNumber}`);
		} else {
			this.cache.clear();
			streamDeck.logger.debug("Cleared all cache");
		}
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; entries: number[] } {
		return {
			size: this.cache.size,
			entries: Array.from(this.cache.keys())
		};
	}
}
