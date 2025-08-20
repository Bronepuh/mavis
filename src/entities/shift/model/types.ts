export type ShiftPlan = {
	employee: string;
	store: string;
	role: string;
	startPlanned: string; // ISO
	endPlanned: string; // ISO
};

export type ShiftFact = {
	employee: string;
	store: string;
	role: string;
	startActual: string; // ISO
	endActual: string; // ISO
};
