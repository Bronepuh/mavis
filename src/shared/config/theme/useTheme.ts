"use client";
import React from "react";

export type Theme = "light" | "dark";
const THEME_STORAGE_KEY = "ui-theme";

export function useTheme() {
	const [theme, setTheme] = React.useState<Theme>(() => {
		if (typeof window === "undefined") return "light";
		const saved = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) || null;
		return saved ?? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
	});

	React.useEffect(() => {
		if (typeof document === "undefined") return;

		// атрибут темы для CSS-переменных
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem(THEME_STORAGE_KEY, theme);

		const LINK_ID = "antd-dark-css";
		const PRIMARY = "/antd.dark.css";
		const CDN = "https://cdn.jsdelivr.net/npm/antd@4.24.15/dist/antd.dark.css";

		let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
		const enable = theme === "dark";

		if (enable) {
			if (!link) {
				link = document.createElement("link");
				link.id = LINK_ID;
				link.rel = "stylesheet";
				link.href = PRIMARY; // попробуем локальный
				link.crossOrigin = "anonymous";
				// если 404 — подменим на CDN (один раз, без зацикливания)
				link.addEventListener(
					"error",
					() => {
						if (link && link.href !== CDN) link.href = CDN;
					},
					{ once: true },
				);
				document.head.appendChild(link);
			}
			link.disabled = false;
		} else if (link) {
			link.disabled = true; // отключаем, но не удаляем (быстрее повторное включение)
		}
	}, [theme]);

	return { theme, setTheme };
}
