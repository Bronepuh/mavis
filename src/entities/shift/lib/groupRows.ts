import dayjs from "dayjs";
import { ShiftPlan } from "../model/types";

/**
 * Форматирует таймстемп (мс) в строку времени `HH:mm`.
 *
 * @param {number} ms Таймстемп в миллисекундах
 * @returns {string} Время в формате `HH:mm`
 * @example
 * fmt(1755519600000) // "09:00"
 */
export const fmt = (ms: number): string => dayjs(ms).format("HH:mm");

/**
 * Ограничивает число n диапазоном [a, b].
 *
 * Используется для «обрезки» временных отрезков по границам выбранного окна.
 *
 * @param {number} n Значение
 * @param {number} a Нижняя граница (включительно)
 * @param {number} b Верхняя граница (включительно)
 * @returns {number} Число в диапазоне [a, b]
 * @example
 * clamp(15, 0, 10) // 10
 * clamp(-3, 0, 10) // 0
 */
export const clamp = (n: number, a: number, b: number): number => Math.max(a, Math.min(b, n));

/**
 * Приводит дату к таймстемпу в мс с начала эпохи (Unix epoch).
 *
 * Поддерживает:
 *  - ISO-строку, напр. `"2025-08-18T09:12:00+02:00"`
 *  - любой объект с методом `valueOf()` (например, `dayjs()`).
 *
 * ⚠️ Валидация: строка не проверяется на корректность;
 * при непарсибельном значении вернётся `NaN`.
 *
 * @param {string | { valueOf(): number }} d Дата в ISO-строке или объект с valueOf()
 * @returns {number} Таймстемп в миллисекундах
 * @example
 * msOf("2025-08-18T09:00:00+02:00") // 1755519600000 (пример)
 */
export const msOf = (d: string | { valueOf(): number }): number => (typeof d === "string" ? dayjs(d).valueOf() : d.valueOf());

/**
 * Группирует плановые смены по ключу `employee__store` и
 * возвращает массив строк для отрисовки с уже ОТРЕЗАННЫМИ по окну [fromMs, untilMs] отрезками.
 *
 * Для каждой строки собираются все отрезки плана `planSegs` (в миллисекундах) и
 * сортируются по старту (возрастающе).
 *
 * Предположение: роль (`role`) в рамках пары `employee + store` стабильна.
 * Если в исходных данных роли различаются, используется значение из первой встретившейся записи.
 *
 * Сложность: O(N log K), где N — число плановых смен, K — число отрезков в строке (лог за сортировку).
 *
 * @param {ShiftPlan[]} plan Список плановых смен
 * @param {number} fromMs Левая граница окна (включительно), мс
 * @param {number} untilMs Правая граница окна (включительно), мс
 * @returns {Array<{ employee: string; store: string; role: string; planSegs: { s: number; e: number }[] }>}
 *          Массив строк, где `planSegs` — отрезки в мс, отсортированные по `s`
 *
 * @example
 * const plan: ShiftPlan[] = [
 *   { employee: "Иван", store: "A", role: "Кассир",
 *     startPlanned: "2025-08-18T09:00:00+02:00", endPlanned: "2025-08-18T17:30:00+02:00" },
 *   { employee: "Иван", store: "A", role: "Кассир",
 *     startPlanned: "2025-08-19T12:00:00+02:00", endPlanned: "2025-08-19T20:00:00+02:00" },
 * ];
 * const from = msOf("2025-08-18T00:00:00+02:00");
 * const until = msOf("2025-08-19T23:59:59+02:00");
 *
 * const rows = groupRows(plan, from, until);
 * // [
 * //   {
 * //     employee: "Иван",
 * //     store: "A",
 * //     role: "Кассир",
 * //     planSegs: [
 * //       { s: 1755519600000, e: 1755546600000 }, // 18-е, 09:00—17:30
 * //       { s: 1755607200000, e: 1755633600000 }, // 19-е, 12:00—20:00
 * //     ]
 * //   }
 * // ]
 */
export function groupRows(
	plan: ShiftPlan[],
	fromMs: number,
	untilMs: number,
): Array<{ employee: string; store: string; role: string; planSegs: { s: number; e: number }[] }> {
	const map = new Map<
		string,
		{
			employee: string;
			store: string;
			role: string;
			planSegs: { s: number; e: number }[];
		}
	>();

	for (const p of plan) {
		const s = msOf(p.startPlanned),
			e = msOf(p.endPlanned);

		// пропускаем, если нет пересечения с окном
		if (e < fromMs || s > untilMs) continue;

		const key = `${p.employee}__${p.store}`;
		if (!map.has(key)) {
			map.set(key, { employee: p.employee, store: p.store, role: p.role, planSegs: [] });
		}

		// добавляем отрезок, обрезанный по окну
		map.get(key)!.planSegs.push({
			s: clamp(s, fromMs, untilMs),
			e: clamp(e, fromMs, untilMs),
		});
	}

	// сортируем отрезки внутри каждой строки (по возрастанию начала)
	return Array.from(map.values()).map((r) => ({
		...r,
		// NOTE: Array.prototype.toSorted — ES2023. Если у вас таргет старее, замените на r.planSegs.slice().sort(...)
		planSegs: r.planSegs.toSorted((a, b) => a.s - b.s),
	}));
}
