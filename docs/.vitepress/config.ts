import { defineConfig } from "vitepress";

export default defineConfig({
	ignoreDeadLinks: true,
	base: "/svitore/",
	title: "Svitore",
	description: "State manager",
	themeConfig: {
		nav: [{ text: "Home", link: "/" }],

		sidebar: [
			{ text: "Get Started", link: "/getting-started" },
			{
				text: "Entities",
				items: [
					{
						text: "AbstractEntity",
						link: "/entities/abstract-entity",
					},
					{
						text: "State",
						link: "/entities/state",
					},
					{
						text: "PersistState",
						link: "/entities/persist-state",
					},
					{
						text: "ComputedState",
						link: "/entities/computed-state",
					},
				],
			},
			{
				text: "React",
				items: [{ text: "Get Started", link: "/react/getting-started" }],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/vitlolik/svitore" },
		],
	},
});
