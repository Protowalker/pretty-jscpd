import { Data, Edge, Network, Node, Options } from "vis-network";
import { Duplicate, initWithResultProcessor, Result } from "../utils";
type Nodes = { [fileName: string]: number };
const getNodes = (sortedDupes: Duplicate[]) => {
	const nodes: Nodes = {};

	const addValueToNode = (fileName: string, lines: number) => {
		nodes[fileName] = nodes[fileName] ? nodes[fileName] + lines : lines;
	};

	for (let i = 0; i < sortedDupes.length; i += 1) {
		const dupe = sortedDupes[i];

		addValueToNode(dupe.firstFile.name, dupe.lines);
		addValueToNode(dupe.secondFile.name, dupe.lines);
	}

	return nodes;
};

type EdgeGraph = {
	[firstFileName: string]: {
		[secondFileName: string]: {
			instances: number;
			lines: number;
			tokens: number;
		};
	};
};

const getEdges = (dupes: Duplicate[]) => {
	const edges: EdgeGraph = {};

	for (let i = 0; i < dupes.length; i += 1) {
		const dupe = dupes[i];
		const fromFile = dupe.firstFile.name;
		const toFile = dupe.secondFile.name;

		if (!edges[fromFile]) {
			edges[fromFile] = {};
		}

		if (!edges[fromFile][toFile]) {
			edges[fromFile][toFile] = { instances: 0, lines: 0, tokens: 0 };
		}

		edges[fromFile][toFile].instances += 1;
		edges[fromFile][toFile].lines += dupe.lines;
		edges[fromFile][toFile].tokens += dupe.tokens;
	}

	return edges;
};

const generateNodesArray = (nodesObject: Nodes) => {
	const nodesArray: Node[] = [];

	for (const [filePath, dupeCount] of Object.entries(nodesObject)) {
		nodesArray.push({
			id: filePath,
			value: dupeCount,
			label: filePath,
		});
	}

	return nodesArray;
};

const generateEdgesArray = (edgesObject: EdgeGraph) => {
	const edgesArray: Edge[] = [];

	let instances = 0;
	let lines = 0;
	let tokens = 0;

	for (const [fromNode, toNodes] of Object.entries(edgesObject)) {
		for (const [toNode, dupeStats] of Object.entries(toNodes)) {
			instances = dupeStats.instances;
			lines = dupeStats.lines;
			tokens = dupeStats.tokens;
			edgesArray.push({
				from: fromNode,
				to: toNode,
				value: lines,
				title: `duplicated ${instances} times, with ${lines} lines, ${tokens} tokens.`,
			});
		}
	}

	return edgesArray;
};

const draw = (report: Result) => {
	const dupesArray = report.duplicates;

	const nodesObject = getNodes(dupesArray);
	const edgesObject = getEdges(dupesArray);

	const nodes = generateNodesArray(nodesObject);
	const edges = generateEdgesArray(edgesObject);

	const container = document.getElementById("files-relation")!;

	const data: Data = {
		nodes,
		edges,
	};

	const options: Options = {
		nodes: {
			shape: "dot",
			scaling: {
				label: {
					min: 8,
					max: 20,
				},
			},
		},
		edges: {
			scaling: {
				min: 1,
				max: 30,
			},
		},
		layout: {
			improvedLayout: false
		}
	};

	const network = new Network(container, data, options);
};

export const graph = () => {
	initWithResultProcessor(draw);
};

const body = document.querySelector("#body") as HTMLBodyElement;
body.onload = graph;
