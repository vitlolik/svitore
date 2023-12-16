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
					{
						text: "Event",
						link: "/entities/event",
					},
					{
						text: "DebouncedEvent",
						link: "/entities/debounced-event",
					},
					{
						text: "ThrottledEvent",
						link: "/entities/throttled-event",
					},
					{
						text: "Effect",
						link: "/entities/effect",
					},
					{
						text: "EffectRunner",
						link: "/entities/effect-runner",
					},
					{
						text: "Reaction",
						link: "/entities/reaction",
					},
				],
			},
			{
				text: "React",
				items: [{ text: "Get Started", link: "/react/getting-started" }],
			},
			{
				text: "Examples",
				link: "/examples",
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/vitlolik/svitore" },
		],
	},
});
