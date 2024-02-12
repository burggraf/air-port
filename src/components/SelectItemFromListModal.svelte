<script lang="ts">
	import { modalController } from '$ionic/svelte';
	import * as allIonicIcons from 'ionicons/icons';
	import { onMount } from 'svelte';

	export let mode = 'grid';
	export let title = 'Select Item';
	export let items: any[] = [];
	export let currentItem: any = null;
	export let allow_write_in = false;
	export let add_new_text: string = 'Add New';
	let other: any = { item: 'Other' };
	// console.log('*** allow_write_in', allow_write_in)
	// console.log('*** currentItem', currentItem)
	// export let extraHTML = '';
	const selectItem = (item: any) => {
		modalController.dismiss({ ...item });
	};
	const toggleMode = () => {
		mode = mode === 'list' ? 'grid' : 'list';
	};
	onMount(() => {
		setTimeout(() => {
			const thing =
				document.getElementById('selectorDiv')?.parentElement?.parentElement?.parentElement ||
				({} as any);
			const toolbar = document.getElementById('selectorToolbar') || ({} as any);
			const h = thing?.clientHeight - toolbar?.clientHeight + 'px';
			const obj1 = document.getElementById('selectorDiv')?.parentElement?.parentElement?.style;
			const obj2 = document.getElementById('selectorDiv')?.parentElement?.style;
			const obj3 = document.getElementById('selectorDiv')?.style;
			if (obj1) obj1.height = h;
			if (obj2) obj2.height = h;
			if (obj3) obj3.height = h;
		}, 200);
	});
</script>

<ion-header>
	<ion-toolbar color="tertiary" id="selectorToolbar">
		<ion-buttons slot="start">
			<ion-button
				on:click={() => {
					selectItem(null);
				}}
			>
				<ion-icon slot="icon-only" icon={allIonicIcons.closeOutline} />
			</ion-button>
		</ion-buttons>
		<!-- <ion-buttons slot="end">
			<ion-button on:click={toggleMode}>
				<ion-icon
					slot="icon-only"
					icon={mode === 'list' ? allIonicIcons.listOutline : allIonicIcons.gridOutline}
				/>
			</ion-button>
		</ion-buttons> -->
		<ion-title>{title}</ion-title>
	</ion-toolbar>
</ion-header>

<ion-content>
	<div id="selectorDiv" style="overflow-y: scroll;">
		{#each items as item}
			<ion-item
				class={item.item===currentItem?'selected':''}
				lines="full"
				on:click={() => {
					selectItem(item);
				}}
			>
				{#if item.icon && typeof item.icon === 'string'} 
					{#if typeof item.icon === 'string'}
					<ion-icon slot="start" color={item.color} icon={allIonicIcons[item.icon]} />
					{:else}
					<ion-icon slot="start" color={item.color} icon={item.icon} />
					{/if}
				{/if}
				<ion-label>
					<div>{@html item.item.contents}</div>
				</ion-label>
			</ion-item>
		{/each}
		{#if allow_write_in}
		<ion-item-divider>{add_new_text}</ion-item-divider>
		<ion-item lines="none">
			<ion-label slot="start">Name:</ion-label>
			<ion-input placeholder="type other" on:ionChange={(e)=>{other.name = e.detail.value;}} />
		</ion-item>
		<ion-item lines="none">
			<ion-label slot="start">Description:</ion-label>
			<ion-input placeholder="type other" on:ionChange={(e)=>{other.description = e.detail.value;}} />
		</ion-item>
		<div class="ion-padding">
			<ion-button expand="block" 
			disabled={other?.item?.length===0 || other?.description?.length===0}
			on:click={()=>{selectItem({item: other.name, description: other.description, is_new: true});}}>{add_new_text}</ion-button>
		</div>
		{/if}
	</div>
</ion-content>

<style>
	.selected {
		--background: #e0e0e0;
		background-color: #e0e0e0;
		color: black;
	}
</style>
