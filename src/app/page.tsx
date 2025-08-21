"use client";
import React from "react";
import plan from "@/shared/api/dto/plan.json";
import fact from "@/shared/api/dto/fact.json";
import Schedule from "@/widgets/schedule/ui/Schedule";
import { ConfigProvider, Divider, Space, Tag, Typography, ruRU } from "@/shared/lib/antd/reexport";
import { DEVIATION_LABEL, DeviationType } from "@/entities/shift/model/deviation";

export default function Page() {
	return (
		<ConfigProvider locale={ruRU}>
			<Schedule plan={plan} fact={fact} />

			<Divider />
			<Space direction="vertical" size={4} style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
				<Typography.Text type="secondary">Легенда:</Typography.Text>
				<Space wrap>
					<Tag color="#4f46e5" style={{ color: "white" }}>
						План
					</Tag>
					<Tag>Факт (штриховка)</Tag>
					<Tag color="error">{DEVIATION_LABEL[DeviationType.Late]}</Tag>
					<Tag color="orange">{DEVIATION_LABEL[DeviationType.Early]}</Tag>
					<Tag color="magenta">{DEVIATION_LABEL[DeviationType.Absence]}</Tag>
				</Space>
			</Space>
		</ConfigProvider>
	);
}
