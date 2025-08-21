"use client";
import React from "react";
import { Checkbox } from "@/shared/lib/antd/reexport";
import { withPersistedChecked } from "@/shared/ui/hoc/withPersistedChecked";

/** Checkbox с поддержкой persist через проп `persistKey`. */
export const PersistedCheckbox = withPersistedChecked(Checkbox);

export default PersistedCheckbox;
