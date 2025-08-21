/**
 * @file getInitialRange.ts
 * Возвращает стартовый диапазон дат для таймлайна:
 * от начала суток «3 дня назад» до конца текущих суток.
 *
 * Примечание:
 * - Возвращаются метки времени в миллисекундах (Unix ms) в ЛОКАЛЬНОЙ тайзоне среды выполнения.
 * - Если используете плагины dayjs `utc/timezone`, поведение startOf/endOf будет следовать им.
 */

import dayjs from "dayjs";

/** Диапазон дат в миллисекундах Unix */
export type DateRangeMs = {
	/** Начало диапазона: 00:00:00 локального времени три дня назад */
	fromMs: number;
	/** Конец диапазона: 23:59:59.999 локального времени текущего дня */
	toMs: number;
};

/**
 * Вычисляет стартовый диапазон для календаря/таймлайна «сегодня и три дня назад».
 *
 * Алгоритм:
 * 1) `fromMs` = now − 3 дня → `startOf('day')`
 * 2) `toMs`   = now → `endOf('day')`
 *
 * @returns {DateRangeMs} Объект с `fromMs` и `toMs` в миллисекундах.
 *
 * @example
 * const { fromMs, toMs } = getInitialRange();
 * // Можно передать в компонент таймлайна:
 * // setFromMs(fromMs); setToMs(toMs);
 */
export function getInitialRange(): DateRangeMs {
	const fromMs = dayjs().subtract(3, "day").startOf("day").valueOf();
	const toMs = dayjs().endOf("day").valueOf();
	return { fromMs, toMs };
}
