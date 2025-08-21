"use client";
import React, { useMemo, useRef, useState } from "react";
import ruRU from "antd/lib/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { DatePicker } from "@/shared/ui/DateRangePicker/DateRangePicker";
import { getInitialRange } from "@/shared/lib/date/getInitialRange";
import { useTheme } from "@/shared/config/theme/useTheme";
import { Filters } from "@/features/timeline-filters/ui/Filters";

import { groupRows } from "@/entities/shift/lib/groupRows";
import { buildFactIndex } from "@/entities/shift/lib/buildFactIndex";

import type { ShiftPlan, ShiftFact } from "@/entities/shift/model/types";
import { useResizeObserver } from "@/shared/lib/dom/useResizeObserver";
import { useTimelineGrid } from "../lib/useTimelineGrid";
import { Timeline } from "./Timeline";
import { Space, ConfigProvider, Typography } from "@/shared/lib/antd/reexport";
import { defaultDeviationFlags } from "@/entities/shift/model/deviation";

import "./timeline.css";

dayjs.locale("ru");

type Props = Readonly<{ plan: ShiftPlan[]; fact: ShiftFact[] }>;

export default function Schedule({ plan, fact }: Props) {
	const { fromMs: initFrom, toMs: initTo } = getInitialRange();
	const [fromMs, setFromMs] = useState(initFrom);
	const [toMs, setToMs] = useState(initTo);

	const [filters, setFilters] = useState({
		showFact: true,
		deviations: defaultDeviationFlags,
	});

	const { theme, setTheme } = useTheme();

	const rows = useMemo(() => groupRows(plan, fromMs, toMs), [plan, fromMs, toMs]);
	const factIdx = useMemo(() => buildFactIndex(fact), [fact]);

	// размеры контейнера
	const containerRef = useRef<HTMLDivElement | null>(null);
	const { width: containerWidth } = useResizeObserver(containerRef);

	// мобилка
	const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

	// метрики сетки
	const leftColWidth = 280;
	const grid = useTimelineGrid({
		fromMs,
		toMs,
		containerWidth,
		leftColWidth,
		isMobile,
	});

	return (
		<ConfigProvider locale={ruRU}>
			<main style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
				<Typography.Title level={3} style={{ marginTop: 8 }}>
					График работы сотрудников
				</Typography.Title>
				<Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
					Next.js + TypeScript + AntD 4.24. План/Факт, опоздания, ранние уходы, прогулы.
				</Typography.Paragraph>

				<Space wrap size="middle" style={{ marginBottom: 12, marginRight: 10 }}>
					<DatePicker.RangePicker
						allowClear={false}
						format="YYYY-MM-DD"
						value={[dayjs(fromMs), dayjs(toMs)] as any}
						onChange={(vals) => {
							const [start, end] = (vals ?? []) as any[];
							const from = start ? start.startOf("day") : dayjs(fromMs);
							const to = end ? end.endOf("day") : dayjs(toMs);
							setFromMs(from.valueOf());
							setToMs(to.valueOf());
						}}
						placeholder={["Дата начала", "Дата окончания"]}
					/>

					<Filters
						showFact={filters.showFact}
						deviations={filters.deviations}
						onChange={(patch) => setFilters((s) => ({ ...s, ...patch }))}
						themeLabel={theme === "dark" ? "Темная тема" : "Светлая тема"}
						themeChecked={theme === "dark"}
						onThemeToggle={(on) => setTheme(on ? "dark" : "light")}
					/>
				</Space>

				{/* Контейнер, который меряем ResizeObserver’ом */}
				<div ref={containerRef}>
					<Timeline
						rows={rows}
						factIdx={factIdx}
						fromMs={fromMs}
						pxPerMs={grid.pxPerMs}
						cols={grid.cols}
						leftColWidth={leftColWidth}
						trackPx={grid.trackPx}
						fullGridPx={grid.fullGridPx}
						daySplits={grid.daySplits}
						isMobile={isMobile}
						filters={filters}
					/>
				</div>
			</main>
		</ConfigProvider>
	);
}
