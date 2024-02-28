<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	// import { page } from '$app/stores'
	import { currentUser } from '$services/backend.service'
	import Login from '$components/Login.svelte'

	import AccordionMenu from './AccordionMenu.svelte'

	import { menuController, modalController, registerMenu } from '$ionic/svelte'
	import * as allIonicIcons from 'ionicons/icons'

	import IOSInstall from '$lib/components/IOSInstall.svelte'

	let hideMenu = true // a hack because the menu shows before the splash (in Chrome on Windows)
	import { showConfirm } from '$services/alert.service'

	// ** get package info
	const app_version = __APP_VERSION__
	const app_name = __APP_NAME__
	// const app_homepage = __APP_HOMEPAGE__
	// const app_description = __APP_DESCRIPTION__
	const app_menu_title = __APP_MENU_TITLE__
	const app_menu_subtitle = __APP_MENU_SUBTITLE__
	// const app_theme_color = __APP_THEME_COLOR__
	// const app_background_color = __APP_BACKGROUND_COLOR__
	// *******************

	import { toast } from '$services/toast'
	import { isOnline } from '$services/network.service'

	onMount(() => {
		// this is unfortunately needed in order to have the menuController API function properly
		// without this, clicking on the icon at the top left does not close the menu
		registerMenu('mainmenu')
	})

	interface AppPage {
		title: string
		url: string
		icon?: string
		iosIcon?: string
		mdIcon?: string
		children?: AppChild[]
		disabled?: boolean
	}
	interface AppChild {
		title: string
		url: string
		icon: string
		disabled?: boolean
	}

	const appPages: AppPage[] = [
		{
			title: 'Apps',
			url: 'apps',
			icon: 'home',
			children: [],
		},
		{
			title: 'Server Map',
			url: 'servermap',
			icon: 'map',
			children: [],
		},
		{
			title: 'Account',
			url: 'account',
			icon: 'person',
			children: [],
			disabled: (!$currentUser)
		},
		{
			title: 'Settings',
			url: 'settings',
			icon: 'settings',
			children: [],
			disabled: (!$currentUser)
		},
		// {
		// 	title: 'Dashboard',
		// 	url: 'dashboardMenu',
		// 	icon: 'barChart',
		// 	children: [
		// 		{ title: 'Welcome', url: 'welcome', icon: 'map', disabled: false },
		// 		{ title: 'Projects', url: 'projects', icon: 'map', disabled: false },
		// 	],
		// },
		{
			title: 'Information & Support',
			url: 'informationMenu',
			icon: 'informationCircle',
			children: [
				{ title: 'About air-port', url: 'about', icon: 'map', disabled: false },
				{ title: 'Terms of Service', url: 'terms', icon: 'map', disabled: false },
				{ title: 'Privacy Policy', url: 'privacy', icon: 'map', disabled: false },
				{ title: 'Support', url: 'support', icon: 'map', disabled: false },
			],
		},
		// {
		// 	title: 'Settings & Profile',
		// 	url: 'settingsMenu',
		// 	icon: 'settings',
		// 	children: [
		// 		{ title: 'Account', url: 'account', icon: 'settings', disabled: false },
		// 		{ title: 'Settings', url: 'settings', icon: 'settings', disabled: false },
		// 	],
		// },
		// {
		// 	title: 'Admin',
		// 	url: 'adminMenu',
		// 	icon: 'lockClosed',
		// 	children: [
		// 		{ title: 'Users', url: 'adm-users', icon: 'map', disabled: true },
		// 	],
		// },
		// {
		// 	title: 'Samples',
		// 	url: 'samples',
		// 	icon: 'starOutline',
		// },
	]

	const badges: any = {};

	const closeAndNavigate = async (url: string) => {
		goto(url)

		menuController.close('mainmenu')
	}
	const closeMenu = async () => {
		menuController.close('mainmenu')
	}

	// hack because of visibility of menu in Chrome/Windows
	setTimeout(() => {
		hideMenu = false
	}, 100)

	const toggleOnlineStatus = async (e: any) => {
		await showConfirm({
			header: 'Manually set online status',
			message: `Force online status to <b>${$isOnline ? 'Offline' : 'Online'}</b>?`,
			okHandler: async () => {
				isOnline.set(!$isOnline)
				toast(
					`Online status set to: <b>${$isOnline ? 'Online' : 'Offline'}</b>`,
					$isOnline ? 'success' : 'danger'
				)
			},
		})
	}
	const toggleDebugger = () => {
		const el = document.getElementById('debugger')
		if (el) {
			if (el.classList.contains('hidden')) {
				el.classList.remove('hidden')
			} else {
				el.classList.add('hidden')
			}
		}
	}
</script>

<ion-menu content-id="main" menu-id="mainmenu" class:menuhide={hideMenu}>
	<ion-header>
		<ion-toolbar color="primary">
			<ion-title>{app_menu_title}</ion-title>
			<ion-img on:click={closeMenu} src="/icon.svg" style="cursor:pointer;margin-left:10px;height:40px;width:40px;" />
		</ion-toolbar>
	</ion-header>
	<ion-content class="">
		<p class="menu_subtitle">
			{app_menu_subtitle}
		</p>
		<div class="login">
			<ion-menu-toggle auto-hide={false}>
				<Login
					providers={['google', 'facebook', 'github']}
					onSignOut={() => {
						localStorage.clear()
						// goto('/');
						window.location.href = '/'
					}}
					onSignIn={() => {
						// goto('/dashboardwelcome');
					}}
					profileFunction={() => {
						//console.log('do some profileFunction here')
						goto('/account');
					}}
				/>
			</ion-menu-toggle>
		</div>

		<AccordionMenu appPages={appPages} {badges} />

		<ion-list>
			<ion-item lines="none" />
		</ion-list>
	</ion-content>
	<ion-footer class="ion-padding">
		{#if $currentUser}
			<div
				class="pointer centered"
				on:click={() => {
					closeAndNavigate('/account')
				}}
			/>
			<br />
		{/if}
		<div
			class="pointer centered"
			on:click={() => {
				closeAndNavigate('/privacy')
			}}
		>
			Privacy Policy
		</div>
		<br />
		<div
			class="pointer centered"
			on:click={() => {
				closeAndNavigate('/terms')
			}}
		>
			Terms of Service
		</div>
		<br />
		<div class="pointer centered" on:click={toggleDebugger}>{app_name} {app_version}</div>
		<div id="debugger" class="hidden">
			<span
				class="pointer"
				on:click={() => {
					localStorage.clear()
				}}>clear cache</span
			>
			<span class="pointer span-on-right" on:click={toggleOnlineStatus}>
				<ion-label color={$isOnline ? 'success' : 'danger'}
					><b>{$isOnline ? 'Online' : 'Offline'}</b></ion-label
				>
			</span>
		</div>
		<br />
	</ion-footer>
</ion-menu>

<style>
	ion-item {
		cursor: pointer;
	}
	.active-item {
		font-weight: bold;
	}

	.menuhide {
		display: none;
	}

	.hidden {
		display: none;
	}
	.pointer {
		cursor: pointer;
	}
	.span-on-right {
		text-align: right;
		float: right;
		padding-right: 5px;
	}
	.centered {
		text-align: center;
	}
	ion-menu ion-content {
		--background: var(--ion-item-background, var(--ion-background-color, #fff));
	}

	ion-item:hover {
		--background: var(--ion-color-light);
		font-weight: bold;
		color: var(--ion-color-primary);
	}
	.menu_subtitle {
		margin-left: 8px;
		margin-right: 8px;
		text-align: center;
		color: var(--ion-color-medium);
	}
	.login {
		margin-left: 10px;
		margin-right: 10px;
	}
</style>
