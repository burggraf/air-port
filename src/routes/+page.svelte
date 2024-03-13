<script lang="ts">
	import IonPage from '$ionpage'
	import '$styles/grid-styles.css'
	import * as allIonicIcons from 'ionicons/icons'

	import { currentUser } from '$services/backend.service'
	import { goto } from '$app/navigation'
	// import * as allIonicIcons from 'ionicons/icons';
	import LoginModal from '$components/LoginModal.svelte'
	import { modalController } from '$ionic/svelte'
	// import { page } from '$app/stores';
	import { onMount } from 'svelte'
	import { currentState } from '$services/state.service'

	//export let providers: Provider[] = [];
	export const providers: string[] = []
	export const onSignIn: Function = () => {}

	const app_version = __APP_VERSION__
	const app_name = __APP_NAME__

	onMount(() => {
		// const page = localStorage.getItem('page')
		// // remove page from localStorage
		// if (page) {
		// 	localStorage.removeItem('page')
		// 	goto(page)
		// }
		// return () => {}
		// if ($currentUser && $currentState.selectedMenuItem) {
		// 	console.log('**********************************')
		// 	console.log('$currentState.selectedMenuItem', $currentState.selectedMenuItem)
		// 	console.log('going to', $currentState.selectedMenuItem)
		// 	console.log('**********************************')
		// 	//goto($currentState.selectedMenuItem);
		// }
		// return () => {}
	})

	const openLoginBox = async () => {
		const openLoginModalController = await modalController.create({
			component: LoginModal,
			componentProps: {
				providers: ['google', 'github'],
				onSignIn: () => {
					goto('/apps')
				},
			},
			showBackdrop: true,
			backdropDismiss: true,
		})

		await openLoginModalController.present()
	}
</script>

<IonPage>
	<ion-header>
		{#if $currentUser}
			<ion-toolbar color="secondary">
				<ion-buttons slot="start">
					<ion-menu-button />
				</ion-buttons>
				<ion-title>Welcome</ion-title>
			</ion-toolbar>
		{/if}
	</ion-header>
	<ion-content class="ion-padding">
		<div class="width-400">
			{#if $currentUser}
				<div class="ion-text-center" style="display: flex; align-items: center; justify-content: center; margin-top: -30px; margin-bottom: 0px;">
					<ion-img
						style="height: 65px; width: 65px; margin-right: 10px; margin-top: 0px;"
						src="/icon.svg"
					/>
					<div>
						<h1 style="font-size: 30pt;"><b>air-port</b></h1>
						<p style="margin-top: -5px;">Where your app takes off!</p>
					</div>
				</div>			
				<div class="center">
					Welcome back <b>{$currentUser?.name || $currentUser?.email}</b>
				</div>
				<br />
				<ion-button
					on:click={() => {
						goto('/new-app')
					}}
					color="secondary"
					size="large"
					expand="block"
				>
					<ion-icon slot="start" icon={allIonicIcons.documentOutline} />
					Create an app now.
				</ion-button><br />
				<ion-button
					on:click={() => {
						goto('/apps')
					}}
					color="primary"
					size="large"
					expand="block"
				>
					<ion-icon slot="start" icon={allIonicIcons.appsOutline} />
					View your list of apps.
				</ion-button><br />
			{:else}
				<div class="ion-text-center" style="display: flex; align-items: center; justify-content: center; margin-top: -30px; margin-bottom: 0px;">
					<ion-img
						style="height: 65px; width: 65px; margin-right: 10px; margin-top: 0px;"
						src="/icon.svg"
					/>
					<div>
						<h1 style="font-size: 30pt;"><b>air-port</b></h1>
						<p style="margin-top: -5px;">Where your app takes off!</p>
					</div>
				</div>			
			{/if}
		</div>
		{#if !$currentUser}
			<div class="width-400">
				<ion-button expand="block" on:click={openLoginBox}>Get Started</ion-button>
			</div>
		{/if}
		<div class="flex-container">
			<div class="flex-item secondary">
				<h3>What is air-port?</h3>
				<ul>
					<li>Pocketbase Hosting in a minute</li>
					<li>High Availabilty</li>
					<li>Globally Distributed</li>
					<li>Read-Write Replicas</li>
					<li>Easy Management Tools</li>
				</ul>
			</div>
			<div class="flex-item tertiary">
				<h3>Highly Available Pocketbase</h3>
				<ul>
					<li>Setup Globally Distributed Replicas</li>
					<li>Automatic Replication Setup</li>
					<li>Geographic Routing</li>
					<li>Failover Handling</li>
					<li>Streaming Backups to S3 (with PITR)</li>
				</ul>
			</div>
			<div class="flex-item primary">
				<h3>Standard Features</h3>
				<ul>
					<li>Create & Manage Apps</li>
					<li>Create & Manage Replicas</li>
					<li>Full Pocketbase Admin Access</li>
					<li>ssh/scp/sftp/rsync Access</li>
					<li>Online Management Tools</li>
				</ul>
			</div>
			<div class="flex-item secondary">
				<h3>Advanced Features</h3>
				<ul>
					<li>coming soon...</li>
					<li>coming soon...</li>
					<li>coming soon...</li>
					<li>coming soon...</li>
					<li>coming soon...</li>
				</ul>
			</div>
			<div class="flex-item tertiary">
				<h3>Pocketbase Features</h3>
				<ul>
					<li>Database with Automatic API</li>
					<li>Authentication (email, oauth, social)</li>
					<li>Storage with S3 Support</li>
					<li>Realtime Database</li>
					<li>Management Dashboard, Hooks, & more</li>
				</ul>
			</div>
			<!-- <div class="flex-item tertiary">
			<h3>What else?</h3>
			<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius id cupiditate exercitationem itaque modi sequi debitis quidem ratione minus placeat beatae quos laudantium iure consequatur possimus rerum tempore, dolore in.</p>
		</div> -->
		</div>
		<!-- <br/> -->
		<!-- <br/><br/><br/><br/>&nbsp; -->
	</ion-content>
	<ion-footer>
		{#if !$currentUser}
			<ion-toolbar color="transparent" class="ion-text-center">
				<b>{app_name} {app_version}</b><br />
				<span
					on:click={() => {
						goto('/terms')
					}}
					class="pointer">Terms of Service</span
				>
				<span>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;</span>
				<span
					on:click={() => {
						goto('/privacy')
					}}
					class="pointer">Privacy</span
				>
				<span>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;</span>
				<span
					on:click={() => {
						goto('/support')
					}}
					class="pointer">Support</span
				>
			</ion-toolbar>
		{/if}
	</ion-footer>

	<!-- <ion-header>
	{#if $currentUser}
		<ion-toolbar color="primary">
			<ion-buttons slot="start">
				<ion-menu-button />
			</ion-buttons>
			<ion-title>air-port</ion-title>
		</ion-toolbar>
	{/if}
</ion-header>
<ion-content class="ion-padding">
	<div class="center flex-container" style="max-width: 500px; background-color:pink;">
		<div style="text-align: center;">
			<span style="font-style: italic;">
				Welcome to air-port
			</span>
			<br/>
			<br/>
			<ion-button expand="block" on:click={openLoginBox}>login</ion-button>
		</div>

	</div>
	<br />
	<br /><br /><br /><br />&nbsp;
</ion-content>
<ion-footer>
	{#if !$currentUser}
		<ion-toolbar color="transparent" class="ion-text-center">
			<b>{app_name} {app_version}</b><br/>
			<span
				on:click={() => {
					goto("/terms");
				}}
				class="pointer">Terms of Service</span
			>
			<span>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;</span>
			<span
				on:click={() => {
					goto("/privacy");
				}}
				class="pointer">Privacy</span
			>
			<span>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;</span>
			<span
				on:click={() => {
					goto("/support");
				}}
				class="pointer">Support</span
			>
		</ion-toolbar>
	{/if}
</ion-footer> -->
</IonPage>

<style>
	.padded {
		padding-left: 5px;
		padding-right: 5px;
	}
	.center {
		text-align: center;
		font-size: 1.2em;
	}
	.width-400 {
		text-align: center;
		max-width: 400px;
		margin: auto;
	}
	h3 {
		text-align: center;
	}

	.flex-item-no-border {
		max-width: 400px;
		width: 400px;
		cursor: pointer;
	}
	.flex-item {
		max-width: 400px;
		width: 400px;
		/* border: 1pt solid; */
		cursor: pointer;
		margin: 10px;
		padding-top: 0px;
		padding-bottom: 10px;
		padding-left: 20px;
		padding-right: 20px;
	}
	.primary {
		color: var(--ion-color-primary-contrast);
		background-color: var(--ion-color-primary);
	}
	.secondary {
		color: var(--ion-color-secondary-contrast);
		background-color: var(--ion-color-secondary);
	}
	.tertiary {
		color: var(--ion-color-tertiary-contrast);
		background-color: var(--ion-color-tertiary);
	}

	.flex-container {
		display: flex;
		display: -webkit-flex;
		display: -moz-flex;
		flex-flow: row nwrap;
		-webkit-flex-flow: row wrap;
		-moz-flex-flow: row wrap;
		justify-content: center;
		align-items: center;
	}
	.pointer {
		cursor: pointer;
	}
	.landing-property {
		width: 300px;
		max-width: 300px;
		margin: 10px;
		cursor: pointer;
		text-align: center;
	}
</style>
