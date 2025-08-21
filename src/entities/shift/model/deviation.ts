/** Типы отклонений фактической смены относительно плана. */
export enum DeviationType {
	Late = "late", // опоздание (факт начинается позже плана)
	Early = "early", // ранний уход (факт заканчивается раньше плана)
	Absence = "absence", // прогул (факта нет в пределах планового интервала)
}

/** Удобный список для перебора. */
export const ALL_DEVIATIONS = [DeviationType.Late, DeviationType.Early, DeviationType.Absence] as const;

/** Булевы флаги по типам отклонений. */
export type DeviationFlags = Record<DeviationType, boolean>;

/** Значения по умолчанию: показываем все отклонения. */
export const defaultDeviationFlags: DeviationFlags = {
	[DeviationType.Late]: true,
	[DeviationType.Early]: true,
	[DeviationType.Absence]: true,
};

/** Лейблы для UI (можно заменить i18n). */
export const DEVIATION_LABEL: Record<DeviationType, string> = {
	[DeviationType.Late]: "Опоздания",
	[DeviationType.Early]: "Ранние уходы",
	[DeviationType.Absence]: "Прогул",
};
