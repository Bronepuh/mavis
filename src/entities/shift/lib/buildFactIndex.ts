import dayjs from "dayjs";
import { ShiftFact } from "../model/types";

const msOf = (d: string | { valueOf(): number }) => (typeof d === "string" ? dayjs(d).valueOf() : d.valueOf());

export function buildFactIndex(facts: ShiftFact[]) {
	const idx = new Map<string, { s: number; e: number }[]>();
	for (const f of facts) {
		const key = `${f.employee}__${f.store}`;
		if (!idx.has(key)) idx.set(key, []);
		idx.get(key)!.push({ s: msOf(f.startActual), e: msOf(f.endActual) });
	}
	return idx;
}
