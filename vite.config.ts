import { sveltekit } from '@sveltejs/kit/vite';
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

/*** get info from package.json ***/
const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

export default defineConfig({
	define: {
		__DATE__: `'${new Date().toISOString()}'`,
		__RELOAD_SW__: false,
		'process.env.NODE_ENV': process.env.NODE_ENV === 'production' ? '"production"' : '"development"',
		'__APP_VERSION__': JSON.stringify(pkg.version),
		'__APP_NAME__': JSON.stringify(pkg.name),
		'__APP_HOMEPAGE__': JSON.stringify(pkg.homepage),
		'__APP_DESCRIPTION__': JSON.stringify(pkg.description),
		'__APP_MENU_TITLE__': JSON.stringify(pkg.menu_title),
		'__APP_MENU_SUBTITLE__': JSON.stringify(pkg.menu_subtitle),
		'__APP_PROFILE_TABLE__': JSON.stringify(pkg.profileTable),
		'__APP_PROFILE_KEY__': JSON.stringify(pkg.profileKey),
		'__APP_THEME_COLOR__': JSON.stringify(pkg.theme_color),
		'__APP_BACKGROUND_COLOR__': JSON.stringify(pkg.background_color),	  
	},
	plugins: [sveltekit()],
	onwarn: (warning, handler) => {
		if (warning.code.startsWith('a11y-')) return
		handler(warning)
	}
});
