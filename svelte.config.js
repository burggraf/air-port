import adapter from '@sveltejs/adapter-static'
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false
		}),
		alias: {
			'$lib': 'src/lib',
			'$ionic': 'src/lib/ionic',
			'$ionpage': 'src/lib/ionic/svelte/components/IonPage.svelte',
			'$interfaces': 'src/interfaces',
			'$models': 'src/models',
			'$services': 'src/services',
			'$styles': 'src/styles',
			'$stores': 'src/stores',
			'$components': 'src/components',
			'$localdata': 'src/localdata',
		}	
	}
};

export default config;
