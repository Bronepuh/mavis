// src/features/timeline-filters/ui/Filters.tsx
"use client";
/**
 * Панель фильтров: тема, показ факта и чекбоксы по типам отклонений (enum).
 */
import React from "react";
import type { FiltersState } from "../model/types";
import { ALL_DEVIATIONS, DEVIATION_LABEL } from "@/entities/shift/model/deviation";
import { Space, Switch } from "@/shared/lib/antd/reexport";
import PersistedCheckbox from "@/shared/ui/PersistedCheckbox";

type Props = Readonly<{
	/** Показ/скрытие фактических смен. */
	showFact: FiltersState["showFact"];
	/** Флаги отклонений. */
	deviations: FiltersState["deviations"];
	/** Патч сохранения изменений. */
	onChange: (patch: Partial<FiltersState>) => void;

	themeLabel: string;
	themeChecked: boolean;
	onThemeToggle: (checked: boolean) => void;
}>;

console.log(ALL_DEVIATIONS);

export function Filters({ showFact, deviations, onChange, themeLabel, themeChecked, onThemeToggle }: Props) {
	return (
		<>
			<Space wrap size="middle" style={{ marginBottom: 16, marginRight: 16 }}>
				<Space align="center">
					<span>{themeLabel}</span>
					<Switch checked={themeChecked} onChange={onThemeToggle} aria-label="Переключатель темы интерфейса" />
				</Space>

				<Space align="center">
					<span>Показывать факт</span>
					<Switch checked={showFact} onChange={(v) => onChange({ showFact: v })} aria-label="Показывать фактические смены" />
				</Space>
			</Space>

			<Space wrap style={{ marginBottom: 16 }}>
				{ALL_DEVIATIONS.map((type) => (
					<PersistedCheckbox
						key={type}
						persistKey={`filters:${type}`}
						checked={deviations[type]}
						onChange={(e) => onChange({ deviations: { ...deviations, [type]: e.target.checked } })}
					>
						{DEVIATION_LABEL[type]}
					</PersistedCheckbox>
				))}
			</Space>
		</>
	);
}
