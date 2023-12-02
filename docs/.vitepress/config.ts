import { defineConfig } from "vitepress";

export default defineConfig({
	title: "Svitore",
	description: "State manager",
	themeConfig: {
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Examples", link: "/markdown-examples" },
		],

		sidebar: [
			{ text: "Get Started", link: "/getting-started" },
			{ text: "Markdown Examples", link: "/markdown-examples" },
			{ text: "Runtime API Examples", link: "/api-examples" },
			{
				text: "Entities",
				items: [
					{
						text: "State",
						link: "/entities/state",
					},
				],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/vitlolik/svitore" },
		],
	},
});