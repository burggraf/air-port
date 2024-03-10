<script lang="ts">
	import { goto } from '$app/navigation'
	import IonPage from '$ionpage'
	import { addOutline, createOutline, ellipse, star } from 'ionicons/icons'
	import { pb, currentUser } from '$services/backend.service'
	import type { AppsRecord, MachinesRecord } from '$models/pocketbase-types'
	import { getRegionName, regions } from '$services/region.service'
	import { toast } from '$services/toast'
	import { loadingBox } from '$services/loadingMessage'

	let apps: AppsRecord[] = [];
	let machines: MachinesRecord[] = [];

	const ionViewWillEnter = async () => {
		if (!$currentUser) {
			goto('/');
		}
		loadData();
		if ($currentUser && $currentUser.verified === false) {
			pb.collection('users').subscribe($currentUser.id, function (e) {
				if (e.record?.verified) {
					currentUser.set({ ...$currentUser, verified: true })
					pb.collection('users').unsubscribe(); 
					// goto('/projects')
				}
			});
		}
	}	
	const loadData = async () => {
		machines = await pb.collection('machines').getFullList({
			// sort: 'name,type,site_name,instance_status',
		})
		console.log('machines', machines)
		apps = await pb.collection('apps').getFullList({
			sort: 'title',
		})
		console.log('apps', apps)
	}
	const newApp = async () => {
		goto('/new-app')
	}
	const updateStatus = async (Domain: string) => {
		const loader = await loadingBox('Updating app status...')
		try {
			const { data, error } = await pb.send(`/update-app-status/${Domain}`, {
				method: 'GET',
			})
			loader.dismiss()
			console.log('updateStatus: data, error', data, error)
		} catch (err) {
			loader.dismiss()
			console.log('OOPS: error updating status', err)
		}
		loadData();
	}

	const getMachinesForApp = (domain: string) => {
		return machines.filter((machine: any) => {
			return machine.Domain === domain
		})
	}
	let filterValue = ''
	const filterApps = (e: any) => {

		for (let i = 0; i < apps.length; i++) {
			const app = apps[i]
			app[i].hidden = false
		}
		const value = e.target.value.toLowerCase()
		if (value !== '') {
			for (let i = 0; i < apps.length; i++) {
				const app = apps[i]
				if (
					app.title && app.Domain &&
					app.title.toLowerCase().indexOf(value) === -1 &&
					app.Domain.toLowerCase().indexOf(value) === -1
				) {
					app[i].hidden = true
				}
			}
		}
	}
</script>

<IonPage {ionViewWillEnter}>
	<ion-header>
		<ion-toolbar color="primary">
			<ion-buttons slot="start">
				<ion-menu-button />
			</ion-buttons>
			<ion-title>air-port apps</ion-title>
			<ion-buttons slot="end">
				{#if $currentUser?.verified === true}
					<ion-button on:click={newApp}>
						<ion-icon slot="icon-only" icon={addOutline} />
					</ion-button>
				{/if}
			</ion-buttons></ion-toolbar
		>
	</ion-header>
	<ion-content>
		{#if $currentUser}
		{#if apps.length > 4}
		<ion-searchbar value={filterValue} 
			debounce={500} 
			on:ionInput={filterApps}
			style="margin-left: 10px;padding-right: 30px;" 
			placeholder="search for project"></ion-searchbar>
		{/if}
		{#if $currentUser && $currentUser.verified === false}
		<div class="width-500">
			<ion-card>
				<ion-card-header>
					<ion-card-title>Verify Your Email</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					You need to verify your email before you can create an app. Please
					check your email for a verification link.
				</ion-card-content>
			</ion-card>
		</div>
		{/if}
		{#if apps.length === 0 && $currentUser.verified === true}
		<div class="width-500">
			<ion-card>
				<ion-card-header>
					<ion-card-title>No Apps Yet</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					Looks like you don't have any apps yet. Click the button below to
					create a new app.
					<ion-button expand="block" on:click={newApp}>
						<ion-icon slot="icon-only" icon={addOutline} />
						Create New App
					</ion-button>
				</ion-card-content>
			</ion-card>
		</div>
		{:else}
		<ion-list>
			<div class="grid-container">
				{#each apps as app}
					<ion-card style="max-width: 400px; display: {app.hidden?'none':'block'};">
						<ion-card-header style="cursor:pointer;"
						on:click|stopPropagation={() => {
							goto(`/app/${app.Domain}`)
						}}
						>
							<ion-card-title>{app.title}</ion-card-title>
							<ion-card-subtitle>
								<ion-grid><ion-row>
									<ion-col>{app.Domain}</ion-col>
									<ion-col class="ion-text-right">{app.type}</ion-col>
								</ion-row></ion-grid>								
							</ion-card-subtitle>
						</ion-card-header>

						<ion-card-content>
							<ion-grid>
								<ion-row>
									<ion-col>
										<ion-button color="dark" size="small" fill="outline" expand="block" on:click={() => {
											window.open(`https://${app.Domain}.fly.dev/_/`);
											}}>
											Manage
											<ion-icon slot="end" src="/pb.svg" />
										</ion-button>
									</ion-col>
									<ion-col>
										<ion-button color="dark" size="small" fill="outline" expand="block" on:click={() => {
											goto(`/app/${app.Domain}`)
											}}>
											Edit
											<ion-icon slot="end" icon={createOutline} color="dark" />
										</ion-button>
									</ion-col>
									<ion-col>
										<ion-button color="dark" size="small" fill="outline" expand="block" on:click={() => {
											window.open(`https://${app.Domain}.fly.dev`);updateStatus(app.Domain || "", 2000);
											}}>
											Launch
											<ion-icon slot="end" src="/launch.svg" />
										</ion-button>										
									</ion-col>
								</ion-row>
							</ion-grid>
							<ion-list>
								{#each getMachinesForApp(app.Domain || "") as machine}
									<ion-item
										style="cursor: url('/refresh.png'), auto;--padding-start:0px;--inner-padding-end: 0px;"
										lines="full"
										on:click={() => {
											updateStatus(app.Domain || "")
										}}
									>
										{getRegionName(machine.region || "")}

										<ion-icon slot="end" icon={machine.is_primary?star:ellipse} color={machine.state==='started'?'success':'warning'} />

									</ion-item>
								{/each}
							</ion-list>
						</ion-card-content>
					</ion-card>
				{/each}
				<ion-card style="max-width: 400px;">
					<!-- <ion-card-header>
						<ion-card-title>Legend</ion-card-title>
					</ion-card-header> -->
					<ion-card-content>
						<ion-list>
							<ion-item-divider>Legend</ion-item-divider>
							<ion-item  lines="none">
								<ion-icon slot="start" icon={star} color="success" />
								Primary (active)
							</ion-item>
							<ion-item  lines="none">
								<ion-icon slot="start" icon={star} color="warning" />
								Primary (standby)
							</ion-item>
							<ion-item  lines="none">
								<ion-icon slot="start" icon={ellipse} color="success" />
								Replica (active)
							</ion-item>
							<ion-item  lines="none">
								<ion-icon slot="start" icon={ellipse} color="warning" />
								Replica (standby)
							</ion-item>
						</ion-list>
					</ion-card-content>
				</ion-card>
			</div>
		</ion-list>
		{/if}
		{:else}

		<div class="width-500">
			<ion-card>
				<ion-card-header>
					<ion-card-title>Sign up or log in</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					You need to sign up or log in to create a project.
				</ion-card-content>
			</ion-card>
		</div>
	
		{/if}
	</ion-content>
</IonPage>

<style>
	.grid-container {
		display: grid;
		grid-template-columns: repeat(
			auto-fill,
			minmax(400px, 1fr)
		); /* Creates as many columns of at least 250px wide as can fit */
		/*grid-gap: 0px;  Adjust the gap between the cards */
		/*padding: 0px;  Optional padding around the grid */
	}

	ion-card {
		max-width: 100%; /* Override the inline style to make the card responsive */
	}
	ion-card-subtitle {
		/* font-family: monospace; */
		text-transform: lowercase;	
	}

	.width-500 {
		text-align: center;
		max-width: 500px;
		margin: auto;
	}

</style>
