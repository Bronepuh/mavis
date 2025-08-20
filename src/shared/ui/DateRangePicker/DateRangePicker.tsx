"use client";
import generatePicker from "antd/es/date-picker/generatePicker";
import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs";
import type { Dayjs } from "dayjs";

export const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);
