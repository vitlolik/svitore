import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

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
			formats: ["es"],
		},
	},
});
