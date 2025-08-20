import dayjs from "dayjs";
import { ShiftPlan } from "../model/types";

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const msOf = (d: string | { valueOf(): number }) => (typeof d === "string" ? dayjs(d).valueOf() : d.valueOf());

export function groupRows(plan: ShiftPlan[], fromMs: number, untilMs: number) {
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
		if (e < fromMs || s > untilMs) continue;
		const key = `${p.employee}__${p.store}`;
		if (!map.has(key)) map.set(key, { employee: p.employee, store: p.store, role: p.role, planSegs: [] });
		map.get(key)!.planSegs.push({ s: clamp(s, fromMs, untilMs), e: clamp(e, fromMs, untilMs) });
	}

	return Array.from(map.values()).map((r) => ({
		...r,
		planSegs: r.planSegs.toSorted((a, b) => a.s - b.s),
	}));
}
