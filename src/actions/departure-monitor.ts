import { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, SendToPluginEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import { WienerLinienClient } from "../api/wienerlinien-client";
import type { DepartureInfo } from "../types/wienerlinien";
import { createCanvas } from "@napi-rs/canvas";

/**
 * Stream Deck action that displays real-time departure information from Wiener Linien
 * Shows: LINE_CODE, DESTINATION, and COUNTDOWN in minutes
 */
@action({ UUID: "com.mikel-me.wienerlinien.departure" })
export class DepartureMonitor extends SingletonAction<DepartureSettings> {
	private client = new WienerLinienClient();
	private updateIntervals = new Map<string, NodeJS.Timeout>();
	private progressIntervals = new Map<string, NodeJS.Timeout>();
	private actionSettings = new Map<string, DepartureSettings>();
	private lastUpdateTimes = new Map<string, number>();
	private lastDepartureData = new Map<string, { first: DepartureInfo | null | undefined, second?: DepartureInfo | null | undefined }>();
	private static readonly DEFAULT_REFRESH_INTERVAL = 30; // Default 30 seconds
	private static readonly PROGRESS_UPDATE_INTERVAL = 100; // Update progress bar every 100ms

	/**
	 * When the action becomes visible, start fetching and displaying departure data
	 */
	override async onWillAppear(ev: WillAppearEvent<DepartureSettings>): Promise<void> {
		await this.startMonitoring(ev.action, ev.payload.settings);
	}

	/**
	 * When settings change, restart monitoring with new settings
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<DepartureSettings>): Promise<void> {
		streamDeck.logger.info(`Settings changed for action ${ev.action.id}`);
		await this.startMonitoring(ev.action, ev.payload.settings);
	}

	/**
	 * Start monitoring departures for an action
	 */
	private async startMonitoring(action: any, settings: DepartureSettings): Promise<void> {
		const rbl = settings.rbl;

		// Store settings for this action
		this.actionSettings.set(action.id, settings);

		// Clear any existing interval for this context
		this.stopUpdates(action.id);

		if (!rbl) {
			streamDeck.logger.warn(`Action ${action.id} has no RBL number configured`);
			// Render "No Station set" message as an image (similar to error messages)
			await this.renderNoStationSetImage(action);
			return;
		}

		// Validate RBL is a number
		const rblNumber = parseInt(rbl, 10);
		if (isNaN(rblNumber)) {
			streamDeck.logger.error(`Invalid RBL number: ${rbl}`);
			// Render "Invalid RBL" message as an image
			await this.renderInvalidRBLImage(action);
			return;
		}

		// Get refresh interval (default 30 seconds, min 10 seconds)
		const refreshInterval = Math.max((settings.refreshInterval || DepartureMonitor.DEFAULT_REFRESH_INTERVAL), 10);

		streamDeck.logger.info(`Starting monitoring for RBL ${rblNumber}, refresh interval: ${refreshInterval}s`);

		// Initial fetch and display
		await this.updateDeparture(action.id, rblNumber);
		this.lastUpdateTimes.set(action.id, Date.now());

		// Set up periodic updates
		const interval = setInterval(async () => {
			await this.updateDeparture(action.id, rblNumber);
			this.lastUpdateTimes.set(action.id, Date.now());
		}, refreshInterval * 1000); // Convert seconds to milliseconds

		this.updateIntervals.set(action.id, interval);

		// Set up progress bar updates if enabled (default: true)
		const showProgressBar = settings.showProgressBar !== undefined ? settings.showProgressBar : true;
		if (showProgressBar) {
			streamDeck.logger.info(`Starting progress bar for action ${action.id}`);
			this.startProgressBar(action.id);
		}

		streamDeck.logger.info(`Started monitoring RBL ${rblNumber} for action ${action.id} (refresh every ${refreshInterval}s)`);
	}

	/**
	 * Handle messages from Property Inspector (like refresh button)
	 */
	override async onSendToPlugin(ev: SendToPluginEvent<any, DepartureSettings>): Promise<void> {
		if (ev.payload.event === 'refreshNow') {
			streamDeck.logger.info(`Manual refresh triggered from Property Inspector for action ${ev.action.id}`);

			const settings = this.actionSettings.get(ev.action.id);
			if (!settings?.rbl) {
				streamDeck.logger.warn(`Cannot refresh: No RBL configured for action ${ev.action.id}`);
				return;
			}

			const rblNumber = parseInt(settings.rbl, 10);
			if (isNaN(rblNumber)) {
				streamDeck.logger.error(`Cannot refresh: Invalid RBL number ${settings.rbl}`);
				return;
			}

			// Clear cache and force refresh
			this.client.clearCache(rblNumber);
			await this.updateDeparture(ev.action.id, rblNumber);
			this.lastUpdateTimes.set(ev.action.id, Date.now());
		}
	}

	/**
	 * When the action is pressed, force refresh the departure data
	 */
	override async onKeyDown(ev: KeyDownEvent<DepartureSettings>): Promise<void> {
		const { settings } = ev.payload;
		const rbl = settings.rbl;

		if (!rbl) {
			return;
		}

		const rblNumber = parseInt(rbl, 10);
		if (isNaN(rblNumber)) {
			return;
		}

		try {
			// Clear cache and force refresh
			this.client.clearCache(rblNumber);
			await this.updateDeparture(ev.action.id, rblNumber);
			this.lastUpdateTimes.set(ev.action.id, Date.now());
			streamDeck.logger.info(`Manual refresh for RBL ${rblNumber}`);
		} catch (error) {
			streamDeck.logger.error("Manual refresh failed:", error);
		}
	}

	/**
	 * When the action disappears, stop updates to save resources
	 */
	override onWillDisappear(ev: WillDisappearEvent<DepartureSettings>): void {
		this.stopUpdates(ev.action.id);
		streamDeck.logger.info(`Stopped monitoring for action ${ev.action.id}`);
	}

	/**
	 * Update the departure information display
	 */
	private async updateDeparture(actionId: string, rblNumber: number): Promise<void> {
		const action = this.actions.find((a) => a.id === actionId);
		if (!action) {
			streamDeck.logger.warn(`Action ${actionId} not found, cannot update`);
			return;
		}

		try {
			streamDeck.logger.debug(`Fetching departure for RBL ${rblNumber}, action ${actionId}`);

			const settings = this.actionSettings.get(actionId);
			const showTwoDepartures = settings?.showTwoDepartures !== false; // Default to true
			const lineFilter = settings?.lineFilter?.trim();

			// Parse line filter into array of normalized line codes
			let allowedLines: string[] | null = null;
			if (lineFilter) {
				allowedLines = lineFilter
					.split(',')
					.map(line => line.trim().toUpperCase())
					.filter(line => line.length > 0);
				streamDeck.logger.debug(`Filtering for lines: ${allowedLines.join(', ')}`);
			}

			// Fetch more departures to account for filtering
			const maxDepartures = showTwoDepartures ? 20 : 10;
			let allDepartures = await this.client.getDepartures(rblNumber, maxDepartures);

			if (!allDepartures || allDepartures.length === 0) {
				// No departures in next 70 minutes
				streamDeck.logger.info(`No departures found for RBL ${rblNumber}`);
				// Clear cached data to prevent progress bar from showing old data
				this.lastDepartureData.delete(actionId);
				await this.renderDepartureImage(action, null, null);
				return;
			}

			// Filter by line if specified
			if (allowedLines && allowedLines.length > 0) {
				allDepartures = allDepartures.filter(dep =>
					allowedLines!.includes(dep.line.toUpperCase())
				);

				if (allDepartures.length === 0) {
					streamDeck.logger.info(`No departures found for filtered lines at RBL ${rblNumber}`);
					// Clear cached data to prevent progress bar from showing old data
					this.lastDepartureData.delete(actionId);
					// Show "No line found" message instead of generic "No Departures"
					await this.renderNoLineFoundImage(action);
					return;
				}
			}

			if (showTwoDepartures) {
				// Get the first departure's line
				const firstDeparture = allDepartures[0];
				const targetLine = firstDeparture.line;

				// Find the second departure of the same line
				const secondDeparture = allDepartures.slice(1).find(dep => dep.line === targetLine) || null;

				// Cache the departure data
				this.lastDepartureData.set(actionId, { first: firstDeparture, second: secondDeparture });

				// Calculate initial progress if progress bar is enabled
				const showProgressBar = settings?.showProgressBar !== undefined ? settings.showProgressBar : true;
				const progressPercent = showProgressBar ? 0 : undefined;

				// Render custom image with departure info
				await this.renderDepartureImage(action, firstDeparture, secondDeparture, progressPercent);

				streamDeck.logger.debug(`Updated action ${actionId}: ${firstDeparture.line} to ${firstDeparture.towards} in ${firstDeparture.countdown} min` +
					(secondDeparture ? ` and ${secondDeparture.countdown} min` : ''));
			} else {
				// Show only the first departure
				const departure = allDepartures[0];

				// Cache the departure data
				this.lastDepartureData.set(actionId, { first: departure, second: null });

				// Calculate initial progress if progress bar is enabled
				const showProgressBar = settings?.showProgressBar !== undefined ? settings.showProgressBar : true;
				const progressPercent = showProgressBar ? 0 : undefined;

				// Render custom image with single departure info
				await this.renderDepartureImage(action, departure, null, progressPercent);

				streamDeck.logger.debug(`Updated action ${actionId}: ${departure.line} to ${departure.towards} in ${departure.countdown} min`);
			}
		} catch (error: any) {
			const errorMessage = error?.message || String(error);
			streamDeck.logger.error(`Failed to update departure for RBL ${rblNumber}, action ${actionId}: ${errorMessage}`);
			streamDeck.logger.error(`Error stack:`, error?.stack);

			await this.renderDepartureImage(action, undefined, undefined);
		}
	}

	/**
	 * Render a custom image with departure information
	 */
	private async renderDepartureImage(action: any, firstDeparture: DepartureInfo | null | undefined, secondDeparture?: DepartureInfo | null | undefined, progressPercent?: number): Promise<void> {
		// Clear any error title when we're rendering new content
		await action.setTitle("");

		// Create canvas using node-canvas
		const canvas = createCanvas(144, 144);
		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		// Get settings for custom colors
		const settings = this.actionSettings.get(action.id);
		const bgColor = settings?.backgroundColor || '#000000';
		const textColor = settings?.textColor || '#d0cd08';
		const progressColor = settings?.progressBarColor || '#525003';

		// Background
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Text color
		ctx.fillStyle = textColor;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';

		if (firstDeparture === null) {
			// No departures
			ctx.font = '16px sans-serif';
			ctx.fillText('No', 10, 20);
			ctx.fillText('Departures', 10, 45);
			ctx.fillText('Soon', 10, 70);
		} else if (firstDeparture === undefined) {
			// Error
			ctx.font = '16px sans-serif';
			ctx.fillText('Error', 10, 20);
			ctx.fillText('Fetching', 10, 45);
			ctx.fillText('Data', 10, 70);
		} else {
			// Line 1: Line code (larger)
			ctx.font = 'bold 36px sans-serif';
			ctx.fillText(firstDeparture.line, 10, 10);

			// Line 2: Destination (Title Case, slightly larger)
			ctx.font = '22px sans-serif';
			let destination = firstDeparture.towards;
			// Convert to Title Case
			destination = this.toTitleCase(destination);
			ctx.fillText(destination, 10, 57);

			// Line 3: Countdown(s)
			ctx.font = 'bold 28px sans-serif';

			if (secondDeparture) {
				// Two departures: left and center
				const firstCountdown = firstDeparture.countdown <= 0 ? '*' : `${firstDeparture.countdown}`;
				const secondCountdown = secondDeparture.countdown <= 0 ? '*' : `${secondDeparture.countdown}`;

				// First departure on the left
				ctx.textAlign = 'left';
				ctx.fillText(firstCountdown, 10, 95);

				// Second departure in the center
				ctx.textAlign = 'center';
				ctx.fillText(secondCountdown, 72, 95); // Center at 144/2 = 72
			} else {
				// Single departure on the left
				ctx.textAlign = 'left';
				const countdownDisplay = firstDeparture.countdown <= 0 ? '*' : `${firstDeparture.countdown}`;
				ctx.fillText(countdownDisplay, 10, 95);
			}
		}

		// Draw progress bar if specified (bottom 2 pixels)
		if (progressPercent !== undefined && progressPercent >= 0) {
			const progressWidth = Math.floor((canvas.width * progressPercent) / 100);
			ctx.fillStyle = progressColor;
			ctx.fillRect(0, canvas.height - 2, progressWidth, 2);
		}

		// Convert canvas to base64 and set as image
		const buffer = canvas.toBuffer('image/png');
		const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
		await action.setImage(base64);
	}

	/**
	 * Render "No line found" message when line filter doesn't match any departures
	 */
	private async renderNoLineFoundImage(action: any): Promise<void> {
		const canvas = createCanvas(144, 144);
		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		// Get settings for custom colors
		const settings = this.actionSettings.get(action.id);
		const bgColor = settings?.backgroundColor || '#000000';
		const textColor = settings?.textColor || '#d0cd08';

		// Background
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Text color
		ctx.fillStyle = textColor;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';

		// Show "No line found" message
		ctx.font = '16px sans-serif';
		ctx.fillText('No', 10, 40);
		ctx.fillText('Line', 10, 65);
		ctx.fillText('Found', 10, 90);

		// Convert canvas to base64 and set as image
		const buffer = canvas.toBuffer('image/png');
		const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
		await action.setImage(base64);
		await action.setTitle("");
	}

	/**
	 * Render "No Station set in Settings" message when RBL is not configured
	 */
	private async renderNoStationSetImage(action: any): Promise<void> {
		const canvas = createCanvas(144, 144);
		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		// Get settings for custom colors
		const settings = this.actionSettings.get(action.id);
		const bgColor = settings?.backgroundColor || '#000000';
		const textColor = settings?.textColor || '#d0cd08';

		// Background
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Text color
		ctx.fillStyle = textColor;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';

		// Show "No Station set in Settings" message
		ctx.font = '20px sans-serif';
		ctx.fillText('No Station', 10, 30);
		ctx.fillText('set in', 10, 60);
		ctx.fillText('Settings', 10, 90);

		// Convert canvas to base64 and set as image
		const buffer = canvas.toBuffer('image/png');
		const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
		await action.setImage(base64);
		await action.setTitle("");
	}

	/**
	 * Render "Invalid RBL Number" message when RBL is not a valid number
	 */
	private async renderInvalidRBLImage(action: any): Promise<void> {
		const canvas = createCanvas(144, 144);
		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		// Get settings for custom colors
		const settings = this.actionSettings.get(action.id);
		const bgColor = settings?.backgroundColor || '#000000';
		const textColor = settings?.textColor || '#d0cd08';

		// Background
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Text color
		ctx.fillStyle = textColor;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';

		// Show "Invalid RBL Number" message
		ctx.font = '16px sans-serif';
		ctx.fillText('Invalid', 10, 20);
		ctx.fillText('RBL', 10, 45);
		ctx.fillText('Number', 10, 70);

		// Convert canvas to base64 and set as image
		const buffer = canvas.toBuffer('image/png');
		const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
		await action.setImage(base64);
		await action.setTitle("");
	}

	/**
	 * Format departure information for Stream Deck display
	 * Format:
	 * Line 1 (large): LINE_CODE (e.g., U2, 25, 26A)
	 * Line 2: Destination (original case)
	 * Line 3: Minutes until departure (or "*" if departing now)
	 */
	private formatDeparture(departure: DepartureInfo): string {
		// Line 1: Line code/number
		const line = departure.line;

		// Line 2: Destination - keep original case, truncate if too long
		let destination = departure.towards;
		if (destination.length > 15) {
			destination = destination.substring(0, 14) + "…";
		}

		// Line 3: Countdown - show "*" if departing now (0 or 1 minute)
		const countdownDisplay = departure.countdown <= 0 ? "*" : `${departure.countdown}`;

		// Format: line name, destination, countdown
		return `${line}\n${destination}\n${countdownDisplay}`;
	}

	/**
	 * Convert string to Title Case (capitalize first letter of each word and after hyphens)
	 */
	private toTitleCase(str: string): string {
		return str.toLowerCase().replace(/(?:^|\s|-)\w/g, (match) => match.toUpperCase());
	}

	/**
	 * Start the progress bar animation for an action
	 */
	private startProgressBar(actionId: string): void {
		// Stop any existing progress timer
		this.stopProgressBar(actionId);

		const progressInterval = setInterval(() => {
			this.updateProgressBar(actionId);
		}, DepartureMonitor.PROGRESS_UPDATE_INTERVAL);

		this.progressIntervals.set(actionId, progressInterval);
	}

	/**
	 * Stop the progress bar animation for an action
	 */
	private stopProgressBar(actionId: string): void {
		const progressInterval = this.progressIntervals.get(actionId);
		if (progressInterval) {
			clearInterval(progressInterval);
			this.progressIntervals.delete(actionId);
		}
	}

	/**
	 * Update the progress bar for an action
	 */
	private async updateProgressBar(actionId: string): Promise<void> {
		const action = this.actions.find((a) => a.id === actionId);
		if (!action) return;

		const settings = this.actionSettings.get(actionId);
		const showProgressBar = settings?.showProgressBar !== undefined ? settings.showProgressBar : true;
		if (!showProgressBar) return;

		const lastUpdate = this.lastUpdateTimes.get(actionId);
		if (!lastUpdate) return;

		const refreshInterval = Math.max((settings.refreshInterval || DepartureMonitor.DEFAULT_REFRESH_INTERVAL), 10) * 1000;
		const elapsed = Date.now() - lastUpdate;
		const progressPercent = Math.min((elapsed / refreshInterval) * 100, 100);

		// Re-render with current departure data and progress
		// We need to store the current departure data to re-render it
		// For now, we'll trigger a full update which includes the progress
		const rbl = settings.rbl;
		if (rbl) {
			const rblNumber = parseInt(rbl, 10);
			if (!isNaN(rblNumber)) {
				await this.updateDepartureWithProgress(actionId, rblNumber, progressPercent);
			}
		}
	}

	/**
	 * Update departure with progress bar (lightweight version for progress updates)
	 */
	private async updateDepartureWithProgress(actionId: string, rblNumber: number, progressPercent: number): Promise<void> {
		const action = this.actions.find((a) => a.id === actionId);
		if (!action) return;

		// Get cached departure data
		const cachedData = this.lastDepartureData.get(actionId);
		if (!cachedData) return;

		// Re-render with cached data and updated progress
		await this.renderDepartureImage(action, cachedData.first, cachedData.second, progressPercent);
	}

	/**
	 * Stop periodic updates for an action
	 */
	private stopUpdates(actionId: string): void {
		const interval = this.updateIntervals.get(actionId);
		if (interval) {
			clearInterval(interval);
			this.updateIntervals.delete(actionId);
		}

		this.stopProgressBar(actionId);
		this.lastUpdateTimes.delete(actionId);
	}
}

/**
 * Settings for the Departure Monitor action
 */
type DepartureSettings = {
	/** RBL (Rechnergestütztes Betriebsleitsystem) number for the platform/stop */
	rbl?: string;
	/** Comma-separated list of line codes to filter (e.g., "U1, 26A, 13A") */
	lineFilter?: string;
	/** Refresh interval in seconds (default: 30, minimum: 10) */
	refreshInterval?: number;
	/** Show two departures of the same line side-by-side (default: true) */
	showTwoDepartures?: boolean;
	/** Show progress bar indicating time until next refresh (default: false) */
	showProgressBar?: boolean;
	/** Background color as hex code (default: #000000) */
	backgroundColor?: string;
	/** Text color as hex code (default: #d0cd08) */
	textColor?: string;
	/** Progress bar color as hex code (default: #525003) */
	progressBarColor?: string;
};
