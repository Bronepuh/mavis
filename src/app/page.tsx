"use client";
import React from "react";
import ruRU from "antd/lib/locale/ru_RU";
import { ConfigProvider, Divider, Space, Tag, Typography } from "antd";
import plan from "@/shared/api/dto/plan.json";
import fact from "@/shared/api/dto/fact.json";
import Schedule from "@/widgets/schedule/ui/Schedule";

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
					<Tag color="error">Опоздание</Tag>
					<Tag color="orange">Ранний уход</Tag>
					<Tag color="magenta">Прогул</Tag>
				</Space>
			</Space>
		</ConfigProvider>
	);
}
