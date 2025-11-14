/**
 * SVG rendering utilities for Stream Deck buttons
 * Replaces @napi-rs/canvas with pure SVG generation
 */

export interface SVGRenderOptions {
	width?: number;
	height?: number;
	backgroundColor?: string;
	textColor?: string;
	progressBarColor?: string;
}

/**
 * Escape XML special characters for safe SVG text rendering
 */
function escapeXML(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Convert string to Title Case (capitalize first letter of each word and after hyphens)
 */
export function toTitleCase(str: string): string {
	return str.toLowerCase().replace(/(?:^|\s|-)\w/g, (match) => match.toUpperCase());
}

/**
 * Create base SVG element with standard dimensions and background
 */
function createBaseSVG(options: SVGRenderOptions): string {
	const width = options.width || 144;
	const height = options.height || 144;
	const bgColor = options.backgroundColor || '#000000';

	return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
	<rect width="${width}" height="${height}" fill="${bgColor}"/>`;
}

/**
 * Close SVG element
 */
function closeSVG(): string {
	return '</svg>';
}

/**
 * Render "No Departures Soon" message
 */
export function renderNoDeparturesSVG(options: SVGRenderOptions = {}): string {
	const textColor = options.textColor || '#d0cd08';

	let svg = createBaseSVG(options);
	svg += `
	<text x="10" y="20" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">No</text>
	<text x="10" y="45" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">Departures</text>
	<text x="10" y="70" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">Soon</text>`;
	svg += closeSVG();

	return svg;
}

/**
 * Render "Error Fetching Data" message
 */
export function renderErrorSVG(options: SVGRenderOptions = {}): string {
	const textColor = options.textColor || '#d0cd08';

	let svg = createBaseSVG(options);
	svg += `
	<text x="10" y="20" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">Error</text>
	<text x="10" y="45" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">Fetching</text>
	<text x="10" y="70" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">Data</text>`;
	svg += closeSVG();

	return svg;
}

/**
 * Render "No Line Found" message
 */
export function renderNoLineFoundSVG(options: SVGRenderOptions = {}): string {
	const textColor = options.textColor || '#d0cd08';

	let svg = createBaseSVG(options);
	svg += `
	<text x="10" y="40" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">No</text>
	<text x="10" y="65" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">Line</text>
	<text x="10" y="90" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">Found</text>`;
	svg += closeSVG();

	return svg;
}

/**
 * Render "No Station set in Settings" message
 */
export function renderNoStationSetSVG(options: SVGRenderOptions = {}): string {
	const textColor = options.textColor || '#d0cd08';

	let svg = createBaseSVG(options);
	svg += `
	<text x="10" y="30" font-family="sans-serif" font-size="20" fill="${textColor}" dominant-baseline="hanging">No Station</text>
	<text x="10" y="60" font-family="sans-serif" font-size="20" fill="${textColor}" dominant-baseline="hanging">set in</text>
	<text x="10" y="90" font-family="sans-serif" font-size="20" fill="${textColor}" dominant-baseline="hanging">Settings</text>`;
	svg += closeSVG();

	return svg;
}

/**
 * Render "Invalid RBL Number" message
 */
export function renderInvalidRBLSVG(options: SVGRenderOptions = {}): string {
	const textColor = options.textColor || '#d0cd08';

	let svg = createBaseSVG(options);
	svg += `
	<text x="10" y="20" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">Invalid</text>
	<text x="10" y="45" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">RBL</text>
	<text x="10" y="70" font-family="sans-serif" font-size="16" fill="${textColor}" dominant-baseline="hanging">Number</text>`;
	svg += closeSVG();

	return svg;
}

/**
 * Render departure information with optional progress bar
 */
export interface DepartureData {
	line: string;
	towards: string;
	countdown: number;
}

export function renderDepartureSVG(
	firstDeparture: DepartureData,
	secondDeparture: DepartureData | null = null,
	progressPercent: number | undefined = undefined,
	options: SVGRenderOptions = {}
): string {
	const width = options.width || 144;
	const height = options.height || 144;
	const textColor = options.textColor || '#d0cd08';
	const progressColor = options.progressBarColor || '#525003';

	let svg = createBaseSVG(options);

	// Line 1: Line code (larger, bold)
	// Using y position + font-size to simulate canvas textBaseline='top'
	const lineCode = escapeXML(firstDeparture.line);
	svg += `
	<text x="10" y="46" font-family="sans-serif" font-size="36" font-weight="bold" fill="${textColor}">${lineCode}</text>`;

	// Line 2: Destination (Title Case)
	const destination = escapeXML(toTitleCase(firstDeparture.towards));
	svg += `
	<text x="10" y="79" font-family="sans-serif" font-size="22" fill="${textColor}">${destination}</text>`;

	// Line 3: Countdown(s)
	if (secondDeparture) {
		// Two departures: left and center
		const firstCountdown = firstDeparture.countdown <= 0 ? '*' : String(firstDeparture.countdown);
		const secondCountdown = secondDeparture.countdown <= 0 ? '*' : String(secondDeparture.countdown);

		// First departure on the left
		svg += `
	<text x="10" y="123" font-family="sans-serif" font-size="28" font-weight="bold" fill="${textColor}">${firstCountdown}</text>`;

		// Second departure in the center
		svg += `
	<text x="72" y="123" font-family="sans-serif" font-size="28" font-weight="bold" fill="${textColor}" text-anchor="middle">${secondCountdown}</text>`;
	} else {
		// Single departure on the left
		const countdownDisplay = firstDeparture.countdown <= 0 ? '*' : String(firstDeparture.countdown);
		svg += `
	<text x="10" y="123" font-family="sans-serif" font-size="28" font-weight="bold" fill="${textColor}">${countdownDisplay}</text>`;
	}

	// Draw progress bar if specified (bottom 2 pixels)
	if (progressPercent !== undefined && progressPercent >= 0) {
		const progressWidth = Math.floor((width * progressPercent) / 100);
		svg += `
	<rect x="0" y="${height - 2}" width="${progressWidth}" height="2" fill="${progressColor}"/>`;
	}

	svg += closeSVG();
	return svg;
}

/**
 * Convert SVG string to data URL for Stream Deck setImage()
 */
export function svgToDataURL(svg: string): string {
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
