export type ShiftPlan = {
	employee: string; // ФИО
	store: string; // Магазин
	role: string; // Роль
	startPlanned: string; // ISO-строка
	endPlanned: string; // ISO-строка
};

export type ShiftFact = {
	employee: string;
	store: string;
	role: string;
	startActual: string; // ISO
	endActual: string; // ISO
};
