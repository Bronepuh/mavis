"use client";
import { Space, Typography, Tooltip, ConfigProvider } from "antd";
import ruRU from "antd/lib/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import type { Dayjs } from "dayjs";

import { DatePicker } from "@/shared/ui/DateRangePicker/DateRangePicker";
import { getInitialRange } from "@/shared/lib/date/getInitialRange";
import { useTheme } from "@/shared/config/theme/useTheme";
import { Filters } from "@/features/timeline-filters/ui/Filters";

import { ShiftPlan, ShiftFact } from "@/entities/shift/model/types";
import { groupRows } from "@/entities/shift/lib/groupRows";
import { buildFactIndex } from "@/entities/shift/lib/buildFactIndex";
import { HOUR_MS, COL_HOURS } from "@/entities/shift/lib/timeScale";

import "./timeline.css";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { getBarSizeClass, minBarWidth } from "@/shared/ui/DateRangePicker/sizeClass";

dayjs.locale("ru");

type Props = Readonly<{
	plan: ShiftPlan[];
	fact: ShiftFact[];
}>;

export default function Schedule({ plan, fact }: Props) {
	const { fromMs: initFrom, toMs: initTo } = getInitialRange();

	const [fromMs, setFromMs] = useState(initFrom);
	const [toMs, setToMs] = useState(initTo);

	const [filters, setFilters] = useState({
		showFact: true,
		showLate: true,
		showEarly: true,
		showAbsence: true,
	});

	const { theme, setTheme } = useTheme();

	const rows = useMemo(() => groupRows(plan, fromMs, toMs), [plan, fromMs, toMs]);
	const factIdx = useMemo(() => buildFactIndex(fact), [fact]);

	// контейнер и размеры
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [containerWidth, setContainerWidth] = useState(0);
	useEffect(() => {
		if (!containerRef.current) return;
		const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
		ro.observe(containerRef.current);
		return () => ro.disconnect();
	}, []);

	const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
	const leftColWidth = 280;
	const totalMs = Math.max(1, toMs - fromMs);
	const cols = Math.ceil(totalMs / (COL_HOURS * HOUR_MS));
	const available = Math.max(0, containerWidth - leftColWidth);
	const minCol = isMobile ? 56 : 72;
	const colWidth = Math.max(minCol, Math.min(140, cols ? Math.floor(available / cols) : 100));
	const pxPerMs = colWidth / (COL_HOURS * HOUR_MS);
	const trackPx = cols * colWidth;
	const fullGridPx = leftColWidth + trackPx;

	// разделители суток
	const daySplits: number[] = [];
	let d = dayjs(fromMs).startOf("day").add(1, "day").valueOf();
	while (d < toMs) {
		daySplits.push(d);
		d = dayjs(d).add(1, "day").valueOf();
	}

	const fmt = (ms: number) => dayjs(ms).format("HH:mm");
	const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

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
						value={[dayjs(fromMs), dayjs(toMs)] as [Dayjs, Dayjs]}
						onChange={(vals) => {
							const [start, end] = (vals ?? []) as [Dayjs | null, Dayjs | null];
							const from = start ? start.startOf("day") : dayjs(fromMs);
							const to = end ? end.endOf("day") : dayjs(toMs);
							setFromMs(from.valueOf());
							setToMs(to.valueOf());
						}}
						placeholder={["Дата начала", "Дата окончания"]}
					/>

					<Filters
						showFact={filters.showFact}
						showLate={filters.showLate}
						showEarly={filters.showEarly}
						showAbsence={filters.showAbsence}
						onChange={(patch) => setFilters((s) => ({ ...s, ...patch }))}
						themeLabel={theme === "dark" ? "Темная тема" : "Светлая тема"}
						themeChecked={theme === "dark"}
						onThemeToggle={(on) => setTheme(on ? "dark" : "light")}
					/>
				</Space>

				{/* Таймлайн */}
				<div className="timeline nice-scroll" ref={containerRef} style={{ minHeight: "40vh", maxHeight: "calc(100vh - 350px)" }}>
					<div className="timeline__grid" style={{ ["--colw" as string]: `${colWidth}px`, width: `${fullGridPx}px` }}>
						{/* липкая шкала времени */}
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

						{/* строки */}
						{rows.map((r, idx) => {
							const key = `${r.employee}__${r.store}`;
							const facts = factIdx.get(key) || [];
							const isFirstRow = idx === 0;

							return (
								<div key={idx} className="row" style={{ gridTemplateColumns: `${leftColWidth}px 1fr` }}>
									<div className="cell-left">
										<div style={{ fontWeight: 600 }}>{r.employee}</div>
										<div style={{ color: "#8c8c8c", fontSize: 12 }}>
											{r.store} • {r.role}
										</div>
									</div>

									<div className="cell-right">
										{/* трек фиксированной ширины */}
										<div className="track" style={{ width: `${trackPx}px` }}>
											<div className="grid-columns">
												{Array.from({ length: cols + 1 }).map((_, i) => (
													<div key={i} />
												))}
											</div>

											<div className="day-splits">
												{daySplits.map((ms, i) => (
													<div key={i} className="day-split" style={{ left: `${(ms - fromMs) * pxPerMs}px` }} />
												))}
											</div>

											{isFirstRow && (
												<div className="day-labels">
													{daySplits.map((ms, i) => (
														<div key={i} className="day-label" style={{ left: `${(ms - fromMs) * pxPerMs}px` }}>
															{dayjs(ms).format("DD.MM")}
														</div>
													))}
												</div>
											)}

											{/* план/факт */}
											{r.planSegs.map((seg, j) => {
												const left = (seg.s - fromMs) * pxPerMs;
												const width = Math.max((seg.e - seg.s) * pxPerMs, minBarWidth("plan", isMobile));
												const sizeClass = getBarSizeClass(width);

												const overlaps = facts
													.filter((f) => !(f.e < seg.s || f.s > seg.e))
													.map((f) => ({ s: clamp(f.s, seg.s, seg.e), e: clamp(f.e, seg.s, seg.e) }));

												const hasOverlap = overlaps.length > 0;
												const showCapsForThis = sizeClass !== "tiny";

												return (
													<Fragment key={j}>
														<Tooltip
															title={`План: ${fmt(seg.s)} — ${fmt(seg.e)} (≈ ${(
																(seg.e - seg.s) /
																HOUR_MS
															).toFixed(1)} ч)`}
														>
															<div className={`bar plan ${sizeClass}`} style={{ left, width }}>
																<span className="badge">План</span>
																<span className="text">
																	{fmt(seg.s)}—{fmt(seg.e)}
																</span>
															</div>
														</Tooltip>

														{filters.showFact &&
															overlaps.map((fo, k) => {
																const fLeft = (fo.s - fromMs) * pxPerMs;
																const fWidth = Math.max(
																	(fo.e - fo.s) * pxPerMs,
																	minBarWidth("fact", isMobile),
																);
																const fSizeClass = getBarSizeClass(fWidth);

																const lateMs = Math.max(0, fo.s - seg.s);
																const earlyMs = Math.max(0, seg.e - fo.e);

																return (
																	<Fragment key={k}>
																		<Tooltip
																			title={`Факт: ${fmt(fo.s)} — ${fmt(fo.e)} (≈ ${(
																				(fo.e - fo.s) /
																				HOUR_MS
																			).toFixed(1)} ч)`}
																		>
																			<div
																				className={`bar fact ${fSizeClass}`}
																				style={{ left: fLeft, width: fWidth, top: 42 }}
																			>
																				<span className="badge badge--gray">Факт</span>
																				<span className="text">
																					{fmt(fo.s)}—{fmt(fo.e)}
																				</span>
																			</div>
																		</Tooltip>

																		{showCapsForThis && fWidth >= 8 && (
																			<>
																				{filters.showLate && lateMs > 0 && (
																					<div
																						className="deviation lateCap"
																						style={{
																							left,
																							width: Math.max(lateMs * pxPerMs, 2),
																						}}
																						title={`Опоздание: ~${Math.round(
																							lateMs / 60000,
																						)} мин`}
																					/>
																				)}
																				{filters.showEarly && earlyMs > 0 && (
																					<div
																						className="deviation earlyCap"
																						style={{
																							left: (seg.e - earlyMs - fromMs) * pxPerMs,
																							width: Math.max(earlyMs * pxPerMs, 2),
																						}}
																						title={`Ранний уход: ~${Math.round(
																							earlyMs / 60000,
																						)} мин`}
																					/>
																				)}
																			</>
																		)}
																	</Fragment>
																);
															})}

														{filters.showFact && filters.showAbsence && !hasOverlap && (
															<>
																{width >= 64 ? (
																	<>
																		<div className="absenceRing" style={{ left, width }} />
																		<div
																			className="chip chip--absence"
																			style={{ left: left + width / 2 - 28 }}
																		>
																			Прогул
																		</div>
																	</>
																) : (
																	<div
																		className="absenceDot"
																		style={{ left: left + width - 8 }}
																		title="Прогул"
																	/>
																)}
															</>
														)}
													</Fragment>
												);
											})}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</main>
		</ConfigProvider>
	);
}
