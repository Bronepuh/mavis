// src/shared/ui/antd.ts
"use client";

// базовые
export { Space, Tooltip, ConfigProvider, Divider, Tag, Checkbox, Switch, Typography } from "antd";

// даты
export { default as DatePicker } from "antd/es/date-picker";
export type { DatePickerProps, RangePickerProps } from "antd/es/date-picker";

// локаль
export { default as ruRU } from "antd/es/locale/ru_RU";

// подкомпоненты и их пропсы — из подмодулей
export { default as TypographyTitle } from "antd/es/typography/Title";
export type { TitleProps } from "antd/es/typography/Title";

export { default as TypographyText } from "antd/es/typography/Text";
export type { TextProps } from "antd/es/typography/Text";

export { default as TypographyParagraph } from "antd/es/typography/Paragraph";
export type { ParagraphProps } from "antd/es/typography/Paragraph";

export { default as TypographyLink } from "antd/es/typography/Link";
export type { LinkProps } from "antd/es/typography/Link";
