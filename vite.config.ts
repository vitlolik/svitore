import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: {
				core: "./src/index.ts",
				operators: "./src/operators",
			},
			name: "svitore",
		},
	},
});
