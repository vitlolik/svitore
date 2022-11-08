import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: "./src/index.ts",
			fileName: "index",
			name: "svitore",
			formats: ["es", "cjs", "umd"],
		},
	},
});
