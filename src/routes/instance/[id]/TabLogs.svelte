<script lang="ts">
	let stats: any = []
	import type { ProjectInstance } from '$models/interfaces'
	import { currentUser, pb } from '$services/backend.service'
	import { instanceTab } from './instanceTabStore'

	export let project_instance: ProjectInstance = {
		code: '',
		domain: '',
		id: '',
		port: 0,
		site_domain: '',
		site_name: 'Select a site',
		site_id: '',
		type: 'primary',
		db_streaming_backup_location: '',
		logs_streaming_backup_location: '',
		db_streaming_backup_retention: 0,
		logs_streaming_backup_retention: 0
	}
	instanceTab.subscribe(async (value: string) => {
		if (value === 'logs') {
            await loadData();
        }
	})
	if (localStorage.getItem('instance.tab') === 'logs') {
        setTimeout(async () => {await loadData();}, 1000)   
    }


	let sortDirection = 'forward'
	let limit = 50
	const loadData = async () => {
		try {
			const { data, error } = await pb.send(`/getinstancefile`, {
				method: 'POST',
				body: {
					project_instance_id: project_instance?.id,
					path: 'pb_data/log.txt',
				},
			})
			if (data?.raw) {
				let logs = data.raw.replace(/\n$/, '').replace(/└─/g, '  ').replace(/├─/g, '  ').split('\n')
				if (sortDirection === 'reverse') logs.reverse()
				const el = document.getElementById('logviewer')
				if (el) {
					el.innerText = ''
					for (let i = 0; i < (limit > 0 ? Math.min(limit, logs.length) : logs.length); i++) {
						const log = logs[i]
						el.innerText += log + '\n'
					}
				}
			}
		} catch (err) {
			console.error('TabLogs loadData error', err)
		}
	}
	const changeSort = (e: any) => {
		sortDirection = e.detail.value
		loadData()
	}
	const changeLimit = (e: any) => {
		limit = e.detail.value
		loadData()
	}
</script>

<div class="ion-padding" style="overflow: scroll;height: 100%">
	<ion-grid>
		<ion-row>
			<ion-col>
				<ion-segment
					style="xmax-width: 200px;"
					on:ionChange={changeSort}
					id="sortDirection"
					value={sortDirection}
				>
					<ion-segment-button value="forward">
						<ion-label>Forward</ion-label>
					</ion-segment-button>
					<ion-segment-button value="reverse">
						<ion-label>Reverse</ion-label>
					</ion-segment-button>
				</ion-segment>
			</ion-col>
			<ion-col>
				<ion-segment style="xmax-width: 400px;" on:ionChange={changeLimit} id="limit" value={limit}>
					<ion-segment-button value={50}>
						<ion-label>50</ion-label>
					</ion-segment-button>

					<ion-segment-button value={100}>
						<ion-label>100</ion-label>
					</ion-segment-button>

					<ion-segment-button value={500}>
						<ion-label>500</ion-label>
					</ion-segment-button>

					<ion-segment-button value={0}>
						<ion-label>all</ion-label>
					</ion-segment-button>
				</ion-segment>
			</ion-col>
		</ion-row>
	</ion-grid>

	<pre id="logviewer" />
</div>
