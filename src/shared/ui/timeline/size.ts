// enums + константы + helper’ы для ширины плашек

export enum SizeClass {
	Default = "",
	Compact = "compact",
	Ultra = "ultra",
	Tiny = "tiny",
}

export const WIDTH = {
	TINY: 44,
	ULTRA: 72,
	COMPACT: 112,
} as const;

export function getBarSizeClass(widthPx: number): SizeClass {
	if (widthPx < WIDTH.TINY) return SizeClass.Tiny;
	if (widthPx < WIDTH.ULTRA) return SizeClass.Ultra;
	if (widthPx < WIDTH.COMPACT) return SizeClass.Compact;
	return SizeClass.Default;
}

export const BAR_MIN_WIDTH = {
	plan: { mobile: 10, desktop: 6 },
	fact: { mobile: 8, desktop: 4 },
	// для капов используем отдельные пороги, если нужно
} as const;
export type BarKind = keyof typeof BAR_MIN_WIDTH;

export function minBarWidth(kind: BarKind, isMobile: boolean): number {
	const { mobile, desktop } = BAR_MIN_WIDTH[kind];
	return isMobile ? mobile : desktop;
}
