import dayjs from "dayjs";
import { ShiftFact } from "../model/types";

/**
 * Возвращает timestamp в миллисекундах для переданной даты.
 *
 * Поддерживает:
 *  - ISO-строку (например, "2025-08-18T09:12:00+02:00")
 *  - любой объект с методом `valueOf()` (например, экземпляр dayjs)
 *
 * ⚠️ Примечание по валидации:
 *  Функция НЕ проверяет валидность строки. Если строка не парсится dayjs,
 *  результатом будет `NaN`. В потоке приложения считаем вход надёжным.
 *
 * @param {string | { valueOf(): number }} d Дата в ISO-строке или объект с valueOf()
 * @returns {number} Количество миллисекунд с 1970-01-01T00:00:00Z
 * @example
 * msOf("2025-08-18T09:00:00+02:00"); // -> 1755519600000 (пример)
 */
const msOf = (d: string | { valueOf(): number }): number => (typeof d === "string" ? dayjs(d).valueOf() : d.valueOf());

/**
 * Строит индекс фактических отрезков смен (start/end в мс) по ключу `employee__store`.
 *
 * На выходе Map, где:
 *  - ключ:  `${employee}__${store}`
 *  - значение: массив отрезков факта `{ s, e }` (timestamps в мс)
 *
 * Характеристики:
 *  - Сложность: O(N), где N — число записей факта
 *  - НЕ объединяет пересекающиеся отрезки — возвращает то, что пришло
 *  - НЕ обрезает по окну дат — это делается на этапе рендера (через clamp и фильтрацию)
 *
 * Типичный сценарий использования:
 *  1) Построить индекс один раз.
 *  2) Для каждой плановой смены строки взять список фактов по ключу
 *     и вычислить пересечения/отклонения.
 *
 * @param {ShiftFact[]} facts Список фактических смен
 * @returns {Map<string, { s: number; e: number }[]>} Индекс факта по сотрудник+магазин
 *
 * @example
 * // Входные данные
 * const facts: ShiftFact[] = [
 *   {
 *     employee: "Иван Петров",
 *     store: "Магазин A",
 *     role: "Кассир",
 *     startActual: "2025-08-18T09:12:00+02:00",
 *     endActual:   "2025-08-18T17:05:00+02:00",
 *   },
 *   {
 *     employee: "Иван Петров",
 *     store: "Магазин A",
 *     role: "Кассир",
 *     startActual: "2025-08-19T12:00:00+02:00",
 *     endActual:   "2025-08-19T20:00:00+02:00",
 *   },
 * ];
 *
 * // Построение индекса
 * const idx = buildFactIndex(facts);
 *
 * // Получение фактов для строки "Иван Петров" в "Магазин A"
 * const key = "Иван Петров__Магазин A";
 * const segments = idx.get(key) ?? [];
 * // segments -> [{ s: 1755520320000, e: 1755552300000 }, { s: ..., e: ... }]
 *
 * // Пересечение с плановой сменой (пример)
 * const plan = { s: msOf("2025-08-18T09:00:00+02:00"), e: msOf("2025-08-18T17:30:00+02:00") };
 * const overlaps = segments
 *   .filter(f => !(f.e < plan.s || f.s > plan.e))
 *   .map(f => ({ s: Math.max(f.s, plan.s), e: Math.min(f.e, plan.e) }));
 */
export function buildFactIndex(facts: ShiftFact[]): Map<string, { s: number; e: number }[]> {
	const idx = new Map<string, { s: number; e: number }[]>();
	for (const f of facts) {
		const key = `${f.employee}__${f.store}`;
		if (!idx.has(key)) idx.set(key, []);
		idx.get(key)!.push({ s: msOf(f.startActual), e: msOf(f.endActual) });
	}
	return idx;
}
