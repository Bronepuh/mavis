"use client";
import React from "react";

type ExtraProps = {
	/** Ключ для localStorage. Если не задан — персист выключен. */
	persistKey?: string;
};

export function withPersistedChecked<C extends React.ComponentType<any>>(Base: C) {
	type BaseProps = React.ComponentPropsWithoutRef<C>;
	type Props = BaseProps & ExtraProps;

	const Wrapped = React.forwardRef<any, Props>((props, ref) => {
		const { persistKey, checked, defaultChecked, onChange, ...rest } = props as any;
		const isControlled = Object.hasOwn(props, "checked");

		// начальное значение для неконтролируемого варианта
		const [innerChecked, setInnerChecked] = React.useState<boolean>(() => {
			if (isControlled) return Boolean(checked);
			if (persistKey && typeof window !== "undefined") {
				const saved = window.localStorage.getItem(persistKey);
				if (saved != null) return saved === "1";
			}
			return Boolean(defaultChecked);
		});

		// следим за внешним checked в контролируемом режиме
		React.useEffect(() => {
			if (isControlled) setInnerChecked(Boolean(checked));
		}, [isControlled, checked]);

		// ⬇️ всегда синхронизируем текущее значение в localStorage
		React.useEffect(() => {
			if (!persistKey || typeof window === "undefined") return;
			const val = isControlled ? Boolean(checked) : innerChecked;
			try {
				window.localStorage.setItem(persistKey, val ? "1" : "0");
			} catch {}
		}, [persistKey, isControlled, checked, innerChecked]);

		const handleChange = (e: any) => {
			const next = !!e?.target?.checked;

			if (!isControlled) {
				setInnerChecked(next);
			}

			// ⬇️ пишем в LS и при контролируемом варианте тоже
			if (persistKey && typeof window !== "undefined") {
				try {
					window.localStorage.setItem(persistKey, next ? "1" : "0");
				} catch {}
			}

			onChange?.(e);
		};

		return React.createElement(Base as any, {
			...rest,
			ref,
			checked: isControlled ? checked : innerChecked,
			onChange: handleChange,
		});
	});

	Wrapped.displayName = `withPersistedChecked(${(Base as any).displayName || Base.name || "Component"})`;
	return Wrapped;
}
