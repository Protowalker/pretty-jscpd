import {resolve} from 'path';
import { defineConfig } from "vite";

export default defineConfig({
	base: 'pretty-jscpd',
	root: 'src',
	build: {
		outDir: '../dist',
		rollupOptions: {
			input: {
				list: resolve(__dirname, 'src/list/index.html'),
				graph: resolve(__dirname, 'src/graph/index.html')
			}
		}
	},
	
});
