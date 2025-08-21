"use client";
/**
 * Контейнер таймлайна: липкая шкала времени + список строк.
 */
import React from "react";
import dayjs from "dayjs";
import { HOUR_MS, COL_HOURS } from "@/entities/shift/lib/timeScale";

import type { RowVM } from "./Row";
import { Row } from "./Row";
import type { FiltersState } from "@/features/timeline-filters/model/types";

type Props = Readonly<{
	rows: RowVM[];
	factIdx: Map<string, { s: number; e: number }[]>;
	fromMs: number;
	pxPerMs: number;
	cols: number;
	leftColWidth: number;
	trackPx: number;
	fullGridPx: number;
	daySplits: number[];
	isMobile: boolean;
	filters: FiltersState;
}>;

export function Timeline({ rows, factIdx, fromMs, pxPerMs, cols, leftColWidth, trackPx, fullGridPx, daySplits, isMobile, filters }: Props) {
	const colW = Math.round(trackPx / Math.max(cols, 1));

	return (
		<div className="timeline nice-scroll" style={{ minHeight: "40vh", maxHeight: "calc(100vh - 350px)" }}>
			<div className="timeline__grid" style={{ ["--colw" as string]: `${colW}px`, width: `${fullGridPx}px` }}>
				{/* Липкая шкала времени */}
				<div className="ticks" style={{ paddingLeft: leftColWidth }}>
					{Array.from({ length: cols + 1 }).map((_, i) => {
						const ts = fromMs + i * COL_HOURS * HOUR_MS;
						return (
							<div key={i} className="tick">
								{dayjs(ts).format("DD.MM HH:mm")}
							</div>
						);
					})}
				</div>

				{/* Строки таймлайна */}
				{rows.map((r, idx) => {
					const key = `${r.employee}__${r.store}`;
					const facts = factIdx.get(key) || [];
					return (
						<Row
							key={key}
							row={r}
							facts={facts}
							fromMs={fromMs}
							pxPerMs={pxPerMs}
							trackPx={trackPx}
							isMobile={isMobile}
							isFirstRow={idx === 0}
							daySplits={daySplits}
							cols={cols}
							leftColWidth={leftColWidth}
							filters={filters}
						/>
					);
				})}
			</div>
		</div>
	);
}
