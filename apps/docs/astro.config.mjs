// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'S.T.E.P.S Engineering Handbook',
			description:
				'A calm, recovery-first knowledge base for building and operating the S.T.E.P.S platform.',
			social: [
				{
					icon: 'github',
					label: 'S.T.E.P.S on GitHub',
					href: 'https://github.com/S-T-E-P-S/S.T.E.P.S-Native',
				},
			],
			sidebar: [
				{
					label: 'Orientation',
					items: [
						{ label: 'Welcome', slug: 'index' },
						{ label: 'Team Onboarding', slug: 'guides/getting-started' },
						{ label: 'Architecture & Governance Plan', slug: 'guides/architecture-optimization' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
