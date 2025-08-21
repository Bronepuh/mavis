"use client";
/**
 * @file Row.tsx
 *
 * Компонент строки таймлайна: слева информация о сотруднике,
 * справа — «трек» со сменами (план/факт) и визуализацией отклонений.
 *
 * Важные идеи:
 * - Координаты считаются в пикселях: `px = (ms - fromMs) * pxPerMs`.
 * - «План» рисуется ниже, «Факт» — выше, отклонения (caps/absence) поверх.
 * - Подписи дат (разделители суток) показываются только в первой строке.
 * - Мемоизация через `React.memo` для снижения перерисовок.
 */

import React, { Fragment, memo } from "react";
import { Tooltip } from "@/shared/lib/antd/reexport"; // фасад AntD
import dayjs from "dayjs";

import { HOUR_MS } from "@/entities/shift/lib/timeScale";
import { clamp, fmt } from "@/entities/shift/lib/groupRows";
import type { FiltersState } from "@/features/timeline-filters/model/types";
import { DeviationType } from "@/entities/shift/model/deviation";
import { getBarSizeClass, minBarWidth, SizeClass } from "@/shared/ui/timeline/size";

/** Отрезок плановой смены в миллисекундах Unix. */
export type PlanSeg = { s: number; e: number };

/**
 * Модель строки таймлайна (уже сгруппированная по сотруднику+магазину).
 * `planSegs` — массив плановых отрезков в пределах выбранного диапазона.
 */
export type RowVM = {
	employee: string;
	store: string;
	role: string;
	planSegs: PlanSeg[];
};

/**
 * Пропсы строки таймлайна.
 */
type Props = Readonly<{
	/** Данные строки (ФИО/магазин/роль + плановые отрезки). */
	row: RowVM;

	/** Фактические отрезки (предварительно отфильтрованные по сотруднику+магазину). */
	facts: { s: number; e: number }[];

	/** Начало видимого диапазона (мс Unix). Для вычисления абсолютного `left`. */
	fromMs: number;

	/** Коэффициент перевода миллисекунд в пиксели, px/ms. */
	pxPerMs: number;

	/** Ширина дорожки в пикселях (фиксированная, чтобы был горизонтальный скролл). */
	trackPx: number;

	/** Признак мобильной вёрстки — влияет на минимальные ширины баров. */
	isMobile: boolean;

	/** Это первая строка? Тогда рисуем подписи дат над треком. */
	isFirstRow: boolean;

	/** Массив границ суток внутри текущего диапазона (мс Unix). */
	daySplits: number[];

	/** Количество колонок (по 2 часа); нужно для сетки-клеток. */
	cols: number;

	/** Ширина левого столбца (ФИО/магазин). */
	leftColWidth: number;

	/** Активные фильтры (показ факта и отклонений). */
	filters: FiltersState;

	/**
	 * Минимальная ширина факта (в px), начиная с которой показываем «caps» (опоздание/ранний уход).
	 * По умолчанию — 8px, чтобы не загромождать мини-бары.
	 */
	showCapsThreshold?: number;
}>;

/**
 * Строка таймлайна. Содержит:
 * - левую ячейку с данными сотрудника;
 * - правую ячейку с треком времени (план/факт/отклонения).
 *
 * Оптимизации:
 * - Обёрнута в `React.memo` — повторно не рендерится при одинаковых пропсах.
 */
export const Row = memo(function Row({
	row,
	facts,
	fromMs,
	pxPerMs,
	trackPx,
	isMobile,
	isFirstRow,
	daySplits,
	cols,
	leftColWidth,
	filters,
	showCapsThreshold = 8,
}: Props) {
	return (
		<div className="row" style={{ gridTemplateColumns: `${leftColWidth}px 1fr` }}>
			{/* Левый столбец: ФИО / магазин / роль */}
			<div className="cell-left">
				<div style={{ fontWeight: 600 }}>{row.employee}</div>
				<div style={{ color: "#8c8c8c", fontSize: 12 }}>
					{row.store} • {row.role}
				</div>
			</div>

			{/* Правый столбец: трек времени */}
			<div className="cell-right">
				<div className="track" style={{ width: `${trackPx}px` }}>
					{/* Сетка-клетки по 2 часа (визуальные направляющие) */}
					<div className="grid-columns">
						{Array.from({ length: cols + 1 }).map((_, i) => (
							<div key={i} />
						))}
					</div>

					{/* Вертикальные разделители суток */}
					<div className="day-splits">
						{daySplits.map((ms, i) => (
							<div key={i} className="day-split" style={{ left: `${(ms - fromMs) * pxPerMs}px` }} />
						))}
					</div>

					{/* Подписи дат поверх трека — только в первой строке */}
					{isFirstRow && (
						<div className="day-labels">
							{daySplits.map((ms, i) => (
								<div key={i} className="day-label" style={{ left: `${(ms - fromMs) * pxPerMs}px` }}>
									{dayjs(ms).format("DD.MM")}
								</div>
							))}
						</div>
					)}

					{/* План / Факт */}
					{row.planSegs.map((seg, j) => {
						// Раскладка «плана»
						const left = (seg.s - fromMs) * pxPerMs;
						const width = Math.max((seg.e - seg.s) * pxPerMs, minBarWidth("plan", isMobile));
						const sizeClass = getBarSizeClass(width);

						// Поиск пересечений «факта» с текущим плановым сегментом
						const overlaps = facts
							.filter((f) => !(f.e < seg.s || f.s > seg.e))
							.map((f) => ({ s: clamp(f.s, seg.s, seg.e), e: clamp(f.e, seg.s, seg.e) }));

						const hasOverlap = overlaps.length > 0;
						const showCapsForThis = sizeClass !== SizeClass.Tiny;

						return (
							<Fragment key={j}>
								{/* ПЛАН (ниже) */}
								<Tooltip title={`План: ${fmt(seg.s)} — ${fmt(seg.e)} (≈ ${((seg.e - seg.s) / HOUR_MS).toFixed(1)} ч)`}>
									<div className={`bar plan ${sizeClass}`} style={{ left, width }}>
										<span className="badge">План</span>
										<span className="text">
											{fmt(seg.s)}—{fmt(seg.e)}
										</span>
									</div>
								</Tooltip>

								{/* ФАКТ (выше плана) + визуальные «caps» отклонений */}
								{filters.showFact &&
									overlaps.map((fo, k) => {
										const fLeft = (fo.s - fromMs) * pxPerMs;
										const fWidth = Math.max((fo.e - fo.s) * pxPerMs, minBarWidth("fact", isMobile));
										const fSizeClass = getBarSizeClass(fWidth);

										const lateMs = Math.max(0, fo.s - seg.s); // опоздание
										const earlyMs = Math.max(0, seg.e - fo.e); // ранний уход

										return (
											<Fragment key={k}>
												<Tooltip
													title={`Факт: ${fmt(fo.s)} — ${fmt(fo.e)} (≈ ${((fo.e - fo.s) / HOUR_MS).toFixed(
														1,
													)} ч)`}
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

												{/* Caps рисуем только если плашка не «tiny» и видна (ширина не совсем микроскопическая) */}
												{showCapsForThis && fWidth >= showCapsThreshold && (
													<>
														{/* Опоздание — слева от факта до начала плана */}
														{filters.deviations[DeviationType.Late] && lateMs > 0 && (
															<div
																className="deviation lateCap"
																style={{ left, width: Math.max(lateMs * pxPerMs, 2) }}
																title={`Опоздание: ~${Math.round(lateMs / 60000)} мин`}
															/>
														)}

														{/* Ранний уход — справа от факта до конца плана */}
														{filters.deviations[DeviationType.Early] && earlyMs > 0 && (
															<div
																className="deviation earlyCap"
																style={{
																	left: (seg.e - earlyMs - fromMs) * pxPerMs,
																	width: Math.max(earlyMs * pxPerMs, 2),
																}}
																title={`Ранний уход: ~${Math.round(earlyMs / 60000)} мин`}
															/>
														)}
													</>
												)}
											</Fragment>
										);
									})}

								{/* Прогул (факта нет внутри планового сегмента) */}
								{filters.showFact && filters.deviations[DeviationType.Absence] && !hasOverlap && (
									<>
										{width >= 64 ? (
											<>
												<div className="absenceRing" style={{ left, width }} />
												<div className="chip chip--absence" style={{ left: left + width / 2 - 28 }}>
													Прогул
												</div>
											</>
										) : (
											<div className="absenceDot" style={{ left: left + width - 8 }} title="Прогул" />
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
});
