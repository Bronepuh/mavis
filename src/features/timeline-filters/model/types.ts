import { DeviationFlags } from "@/entities/shift/model/deviation";

export type FiltersState = Readonly<{
	showFact: boolean;
	deviations: DeviationFlags;
}>;
