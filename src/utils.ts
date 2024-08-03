const handleFileLoaded = (file: File, resultProcessor: ResultProcessor) => {
	const reader = new FileReader();
	reader.addEventListener("load", (event) => {
		const { result } = event.target;
		resultProcessor(JSON.parse(result));
		if (localStorage) {
			localStorage.setItem("pretty-jscpd", result);
		}
	});
	reader.readAsText(file);
};

const listenToFileUpload = (resultProcessor: ResultProcessor) => {
	const inputElement = document.getElementById(
		"file-input"
	) as HTMLInputElement;

	inputElement.addEventListener("change", (event: Event) => {
		const fileList = inputElement.files;
		if (!fileList) return;
		handleFileLoaded(fileList[0], resultProcessor);
	});
};

export type Location = { line: number; column: number; position: number };
export type DuplicateFile = {
	name: string;
	start: number;
	end: number;
	startLoc: Location;
	endLoc: Location;
};
export type Duplicate = {
	format: string;
	lines: number;
	fragment: string;
	tokens: number;
	firstFile: DuplicateFile;
	secondFile: DuplicateFile;
};

export type StatisticsDatum = {
	lines: number;
	tokens: number;
	sources: number;
	clones: number;
	duplicatedLines: number;
	duplicatedTokens: number;
	percentage: number;
	percentageTokens: number;
	newDuplicatedLines: number;
	newClones: number;
};
export type Statistics = {
	formats: {
		[name: string]: {
			sources: {
				[fileName: string]: StatisticsDatum;
			};
		};
	};
	total: StatisticsDatum;
};

export type Result = {
	statistics: Statistics;
	duplicates: Duplicate[];
};

export type ResultProcessor = (report: Result) => void;

export const initWithResultProcessor = (resultProcessor: ResultProcessor) => {
	const existingReport = localStorage && localStorage.getItem("pretty-jscpd");
	if (existingReport) {
		resultProcessor(JSON.parse(existingReport));
	}
	listenToFileUpload(resultProcessor);
};
