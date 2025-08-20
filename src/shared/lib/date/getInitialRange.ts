import dayjs from "dayjs";

export function getInitialRange() {
	const fromMs = dayjs().subtract(3, "day").startOf("day").valueOf();
	const toMs = dayjs().endOf("day").valueOf();
	return { fromMs, toMs };
}
