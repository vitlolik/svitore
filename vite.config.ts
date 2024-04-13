/// <reference types="vitest" />

import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		dts({
			exclude: ["demo"],
			rollupTypes: true,
		}),
	],
	build: {
		lib: {
			entry: "./src/index.ts",
			fileName: "index",
			formats: ["es", "cjs"],
		},
	},
	test: {
		environment: "jsdom",
		coverage: {
			include: ["**/src/**"],
			exclude: ["**/src/index.ts"],
			provider: "v8",
			thresholds: { "100": true },
		},
	},
});
