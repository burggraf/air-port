<script lang="ts">
	import { dev } from '$app/environment';
	import { preloadCode } from '$app/navigation';
	import { currentUser } from '$services/backend.service';
	import { currentState } from '$services/state.service';
	import * as allIonicIcons from 'ionicons/icons'
	import { goto } from '$app/navigation'


	import Menu from '$lib/components/Menu.svelte';

	import { setupIonicSvelte } from '$ionic/svelte';

	/* Theme variables */
	import '../theme/variables.css';

	// setupIonicSvelte();
	setupIonicSvelte({ mode: 'ios' });


	// Aggressive prefetching for faster rendering
	if (!dev) {
		preloadCode();
	}
</script>

<ion-app>
	<ion-split-pane when={false} content-id="main">
		{#if true || $currentUser}
		<Menu />
		{/if}
		<div class="ion-page" id="main">
			<slot />
		</div>
	</ion-split-pane>
</ion-app>
