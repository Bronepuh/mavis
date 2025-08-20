"use client";
import React from "react";
import { Space, Checkbox, Switch } from "antd";
import type { FiltersState } from "../model/types";

type Props = FiltersState & {
	onChange: (patch: Partial<FiltersState>) => void;
	themeLabel: string;
	themeChecked: boolean;
	onThemeToggle: (checked: boolean) => void;
};

export function Filters({ showFact, showLate, showEarly, showAbsence, onChange, themeLabel, themeChecked, onThemeToggle }: Props) {
	return (
		<>
			<Space wrap size="middle" style={{ marginBottom: 16, marginRight: 16 }}>
				<Space align="center">
					<span>{themeLabel}</span>
					<Switch checked={themeChecked} onChange={onThemeToggle} />
				</Space>
				<Space align="center">
					<span>Показывать факт</span>
					<Switch checked={showFact} onChange={(v) => onChange({ showFact: v })} />
				</Space>
			</Space>

			<Space wrap style={{ marginBottom: 16 }}>
				<Checkbox checked={showLate} onChange={(e) => onChange({ showLate: e.target.checked })}>
					Опоздания
				</Checkbox>
				<Checkbox checked={showEarly} onChange={(e) => onChange({ showEarly: e.target.checked })}>
					Ранние уходы
				</Checkbox>
				<Checkbox checked={showAbsence} onChange={(e) => onChange({ showAbsence: e.target.checked })}>
					Прогул
				</Checkbox>
			</Space>
		</>
	);
}
