<script lang="ts">
	import { goto } from '$app/navigation'
	import IonPage from '$ionpage'
	import { addOutline, constructOutline, ellipseSharp, eyeOutline } from 'ionicons/icons'
	import { pb, currentUser } from '$services/backend.service'
	let projects: any = []
	let project_instances: any = []
	const ionViewWillEnter = async () => {
		if (!$currentUser) {
			goto('/');
		}
		const instance_records = await pb.collection('instance_view').getFullList({
			sort: 'name,type,site_name,instance_status',
		})
		project_instances = instance_records
		const project_records = await pb.collection('projects').getFullList({
			sort: 'name',
		})
		projects = project_records
		if (projects.length === 0) {
			// goto('/newproject')
		}
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
	const newProject = async () => {
		goto('/newproject')
	}
	const getInstancesForProject = (project_id: string) => {
		return project_instances.filter((instance: any) => {
			return instance.project_id === project_id
		})
	}
	let filterValue = ''
	const filterProjects = (e: any) => {

		for (let i = 0; i < projects.length; i++) {
			const project = projects[i]
			projects[i].hidden = false
		}
		const value = e.target.value.toLowerCase()
		if (value !== '') {
			for (let i = 0; i < projects.length; i++) {
				const project = projects[i]
				if (
					project.name.toLowerCase().indexOf(value) === -1 &&
					project.domain.toLowerCase().indexOf(value) === -1
				) {
					projects[i].hidden = true
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
			<ion-title>Azabab Projects</ion-title>
			<ion-buttons slot="end">
				{#if $currentUser?.verified === true}
					<ion-button on:click={newProject}>
						<ion-icon slot="icon-only" icon={addOutline} />
					</ion-button>
				{/if}
			</ion-buttons></ion-toolbar
		>
	</ion-header>
	<ion-content>
		{#if $currentUser}
		{#if projects.length > 4}
		<ion-searchbar value={filterValue} 
			debounce={500} 
			on:ionInput={filterProjects}
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
					You need to verify your email before you can create a project. Please
					check your email for a verification link.
				</ion-card-content>
			</ion-card>
		</div>
		{/if}
		{#if projects.length === 0 && $currentUser.verified === true}
		<div class="width-500">
			<ion-card>
				<ion-card-header>
					<ion-card-title>No Projects Yet</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					Looks like you don't have any projects yet. Click the button below to
					start a new project.
					<ion-button expand="block" on:click={newProject}>
						<ion-icon slot="icon-only" icon={addOutline} />
						Create New Project
					</ion-button>
				</ion-card-content>
			</ion-card>
		</div>
		{:else}
		<ion-list>
			<div class="grid-container">
				{#each projects as project}
					<ion-card style="max-width: 400px; display: {project.hidden?'none':'block'};">
						<ion-card-header style="cursor:pointer;"
						on:click|stopPropagation={() => {
							goto(`/project/${project.id}`)
						}}
						>
							<ion-card-title>{project.name}</ion-card-title>
							<ion-card-subtitle>
								<ion-grid><ion-row>
									<ion-col>{project.domain}</ion-col>
									<ion-col class="ion-text-right">{project.type}</ion-col>
								</ion-row></ion-grid>								
							</ion-card-subtitle>
						</ion-card-header>

						<ion-card-content>
							<ion-list>
								{#each getInstancesForProject(project.id) as instance}
									<ion-item
										style="cursor:pointer;--padding-start:0px;--inner-padding-end: 0px;"
										lines="full"
										on:click={() => {
											goto(`/instance/${instance.id}`)
										}}
									>
										{instance.site_name}
										{instance.type}<br />
										{instance.domain}.{instance.site_domain}

										<ion-button
										slot="end"
										size="small"
										fill="solid"
										color={instance.instance_status === 'online' ? 'success' : instance.instance_status === 'offline' ? 'danger' : 'warning'}
										on:click|stopPropagation={() => {
											// launch in another windows
											window.open(
												`https://${instance.domain}.${instance.site_domain}/`,
												'_blank'
											)
										}}
									>
										<ion-icon slot="icon-only" src="/launch.svg" />
									</ion-button>


										<ion-button
											slot="end"
											size="small"
											fill="clear"
											on:click|stopPropagation={() => {
												// launch in another windows
												window.open(
													`https://${instance.domain}.${instance.site_domain}/_/`,
													'_blank'
												)
											}}
										>
											<ion-icon slot="icon-only" src="/pb.svg" />
										</ion-button>
									</ion-item>
								{/each}
							</ion-list>
						</ion-card-content>
					</ion-card>
				{/each}
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
