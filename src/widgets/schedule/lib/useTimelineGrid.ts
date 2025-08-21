"use client";
import { useMemo } from "react";
import dayjs from "dayjs";
import { HOUR_MS, COL_HOURS } from "@/entities/shift/lib/timeScale";

export type GridMetrics = {
	cols: number;
	colWidth: number;
	pxPerMs: number;
	trackPx: number;
	fullGridPx: number;
	daySplits: number[];
};

type Params = {
	fromMs: number;
	toMs: number;
	containerWidth: number;
	leftColWidth?: number;
	isMobile: boolean;
};

export function useTimelineGrid({ fromMs, toMs, containerWidth, leftColWidth = 280, isMobile }: Params): GridMetrics {
	return useMemo(() => {
		const totalMs = Math.max(1, toMs - fromMs);
		const cols = Math.ceil(totalMs / (COL_HOURS * HOUR_MS));
		const available = Math.max(0, containerWidth - leftColWidth);

		const MIN_COL = isMobile ? 56 : 72;
		const MAX_COL = 140;

		const colWidth = Math.max(MIN_COL, Math.min(MAX_COL, cols ? Math.floor(available / cols) : 100));
		const pxPerMs = colWidth / (COL_HOURS * HOUR_MS);

		const trackPx = cols * colWidth;
		const fullGridPx = leftColWidth + trackPx;

		// границы суток
		const daySplits: number[] = [];
		let d = dayjs(fromMs).startOf("day").add(1, "day").valueOf();
		while (d < toMs) {
			daySplits.push(d);
			d = dayjs(d).add(1, "day").valueOf();
		}

		return { cols, colWidth, pxPerMs, trackPx, fullGridPx, daySplits };
	}, [fromMs, toMs, containerWidth, leftColWidth, isMobile]);
}
