"use client";
/**
 * @file useResizeObserver.ts
 *
 * Хук для наблюдения за изменениями размеров DOM-элемента с помощью `ResizeObserver`.
 * Возвращает текущие `width`/`height` (в пикселях) по `contentRect` наблюдаемого элемента.
 *
 * Особенности:
 * - Работает только на клиенте (файл помечен `"use client"`).
 * - Если `ResizeObserver` недоступен в окружении, хук просто вернёт начальные размеры {0, 0}.
 * - Инициализируем размер сразу через `getBoundingClientRect()`, чтобы не ждать первого события наблюдателя.
 *
 * Примечание:
 * - Используется `entry.contentRect` (content-box). Если нужны размеры по border-box,
 *   можно переключиться на `ResizeObserver` с опцией `{ box: 'border-box' }`
 *   (поддержка зависит от браузера).
 */

import { useEffect, useState } from "react";

/** Размер элемента в пикселях. */
export type ElementSize = Readonly<{ width: number; height: number }>;

/**
 * Подписывается на изменения размеров DOM-элемента и возвращает его текущую ширину и высоту.
 *
 * @param ref React-ref на HTMLElement, за которым нужно наблюдать.
 *            Наблюдатель прикрепляется, когда `ref.current` становится truthy.
 * @returns Объект `{ width, height }`, обновляемый при каждом ресайзе элемента.
 *
 * @example
 * ```tsx
 * const boxRef = useRef<HTMLDivElement>(null);
 * const { width, height } = useResizeObserver(boxRef);
 *
 * return <div ref={boxRef}>Ширина: {width}px, Высота: {height}px</div>;
 * ```
 */
export function useResizeObserver<T extends HTMLElement>(ref: React.RefObject<T>): ElementSize {
	const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

	useEffect(() => {
		const el = ref.current;
		// На всякий случай: если элемента ещё нет или ResizeObserver не поддерживается — выходим.
		if (!el || typeof ResizeObserver === "undefined") return;

		// Первичная инициализация, чтобы не ждать первого коллбэка наблюдателя.
		const rect = el.getBoundingClientRect();
		setSize({ width: rect.width, height: rect.height });

		const ro = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			setSize({ width, height });
		});

		ro.observe(el /* , { box: 'content-box' } */);

		return () => ro.disconnect();
	}, [ref]);

	return size;
}
