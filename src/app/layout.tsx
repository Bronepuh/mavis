import "./globals.css";
import "antd/dist/antd.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
	title: "График работы",
	description: "План/факт смен сотрудников, опоздания, ранние уходы, прогулы.",
};

type RootLayoutProps = Readonly<{ children: ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="ru">
			<body className={`${inter.variable} ${mono.variable}`}>{children}</body>
		</html>
	);
}
