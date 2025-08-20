export type BarSizeClass = "" | "compact" | "ultra" | "tiny";

export const W_COMPACT = 112;
export const W_ULTRA = 72;
export const W_TINY = 44;

export const BAR_MIN_WIDTH = {
	plan: { mobile: 10, desktop: 6 },
	fact: { mobile: 8, desktop: 4 },
} as const;

export type BarKind = keyof typeof BAR_MIN_WIDTH;

export function minBarWidth(kind: BarKind, isMobile: boolean) {
	const { mobile, desktop } = BAR_MIN_WIDTH[kind];
	return isMobile ? mobile : desktop;
}

export function getBarSizeClass(width: number): BarSizeClass {
	if (width < W_TINY) return "tiny";
	if (width < W_ULTRA) return "ultra";
	if (width < W_COMPACT) return "compact";
	return "";
}
