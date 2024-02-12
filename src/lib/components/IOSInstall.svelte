<script lang="ts">
	import { alertController, modalController } from 'ionic-svelte';

	const closeModal = async () => {
		modalController.dismiss();
	};

	const doneThat = async () => {
		const options = {
			header: 'Great!',
			subHeader: 'Thanks for installing Azabab!',
			message: 'The app should now be visible as icon on your home screen.',
			buttons: [
				{
					text: 'Ok',
					handler: (data: any) => {
						closeModal();
					}
				}
			]
		};

		const alert = await alertController.create(options);
		alert.present();
	};

	// default code
	let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
</script>

<svelte:head>
	<title>Install Azabab</title>
</svelte:head>

<ion-content fullscreen class="ion-padding">
	<br />
	<img src="/icon-512.png" alt="Azabab" width="55%" />
	<h2>Hey there!</h2>
	{#if !isSafari}
		<br /><br />
		<h2>You are not running safari.</h2>
		<p>Open this site again with Safari.</p>
		<br />
		<p>Why? Safari is required on iPhone in order to use the "Add-to-Home-Screen" feature.</p>
		<br /><br />
		<ion-button expand="block" on:click={closeModal}>OK - I'll do that!</ion-button>
	{/if}

	{#if isSafari}
		<p>Great! The next step is to add this site to your home screen.</p>

		<p>Select the share option in Safari and then select Add to Home Screen</p>
		<img src="/safari-bar.png" alt="Safari Bar" />
		<br />
		<img width="60%" src="/safari-share-options.png" alt="Safari Share Options" /><br />
		<ion-button expand="block" on:click={doneThat}>I've - done that!</ion-button>
	{/if}
</ion-content>

<style>
	p {
		text-align: center;
	}
	h2 {
		text-align: center;
	}

	img {
		display: block;
		margin-left: auto;
		margin-right: auto;
	}
</style>
