<script lang="ts">

    import IonPage from '$ionpage'
	//db_streaming_backup_location
	//logs_streaming_backup_location
    import '$styles/grid-styles.css'
	import type { ProjectInstance, StreamingBackupSite } from '$models/interfaces'
    import { dropdownmenu } from '$components/DropdownMenu'
	import * as allIonicIcons from 'ionicons/icons'
	import { pb, currentUser } from '$services/backend.service'
	import { toast } from '$services/toast'
	import { arrowBackOutline, cloudDownloadOutline, refreshOutline } from 'ionicons/icons'
    import { page } from '$app/stores'
    import moment from 'moment'
	import { json } from '@sveltejs/kit'
	import { goto } from '$app/navigation'

    export let id = $page.params.id
    export let project_instance: ProjectInstance = 
		{
            name: '',
            project_id: '',
            owner: '',
            ownertype: '',
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
        };
	let streaming_backup_sites: StreamingBackupSite[] = []
    const ionViewWillEnter = async () => {
		if (!$currentUser) {
			goto('/');
		}
        localStorage.setItem('page', window.location.pathname)
        const inst = await pb.collection('instance_view').getOne(id)
        if (inst) {
            for (let attr in project_instance) {
                project_instance[attr] = inst[attr]            
            }
        }
		streaming_backup_sites = await pb.collection('streaming_backup_sites').getFullList({
			fields: 'id, name, location',
		})
    }
    let data: any = {
            db_streaming_backup_location: '',
            logs_streaming_backup_location: '',
            db_streaming_backup_retention: 0,
            logs_streaming_backup_retention: 0        
    };
    const back = () => {
        const restoreGrid = document.getElementById('restoreGrid');
        const regularGrid = document.getElementById('regularGrid');
        if (restoreGrid && regularGrid) {
            if (restoreGrid.style.display === 'none') {
                // window.history.back()
                goto(`/instance/${id}`)
            } else {
                restoreGrid.style.display = 'none';
                regularGrid.style.display = 'block';
            }
        }
    }
    setTimeout(() => {
        data = {
            db_streaming_backup_location: project_instance.db_streaming_backup_location,
            logs_streaming_backup_location: project_instance.logs_streaming_backup_location,
            db_streaming_backup_retention: project_instance.db_streaming_backup_retention,
            logs_streaming_backup_retention: project_instance.logs_streaming_backup_retention
        }
    }, 1000)
    setTimeout(async () => {
        await updateDataGenerations();
        await updateLogsGenerations();
    }, 1000)
    const updateDataGenerations = async () => {
        if (project_instance.db_streaming_backup_location && project_instance.db_streaming_backup_location.length > 0) {
            const data_generations = await getBackupGenerations('data')
            const el = document.getElementById('data-generations')
            if (el) el.innerText = data_generations
        }
    }
    const updateLogsGenerations = async () => {
        if (project_instance.logs_streaming_backup_location && project_instance.logs_streaming_backup_location.length > 0) {
            const logs_generations = await getBackupGenerations('logs')
            const el = document.getElementById('logs-generations')
            if (el) el.innerText = logs_generations
        }
    }
	const chooseStreamingBackupLocation = async (e: any, entity: string) => {
		const items = [{
			text: 'Not enabled',
				icon: allIonicIcons.closeCircleOutline,
				color: 'primary',
				textcolor: 'primary',
				handler: async () => {
					data[entity] = ''
				},
		}]
		for (let i = 0; i < streaming_backup_sites.length; i++) { 
			const streaming_backup_site = streaming_backup_sites[i]
            // you can only choose the current streaming_backup_site or delete it
            // then later pick a new destination
            if (data[entity].length > 0 && streaming_backup_site.id !== data[entity]) continue;
			items.push({
				text: streaming_backup_site.name,
				icon: allIonicIcons.globeOutline,
				color: 'primary',
				textcolor: 'primary',
				handler: async () => {
					data[entity] = streaming_backup_site.id 
				},
			})
		}
		const result = await dropdownmenu(e, items)
	}
	const chooseStreamingBackupRetention = async (e: any, entity: string) => {
		const arr = [0, 24, 72, 168, 336, 504, 720]
		const items = []
		for (let i = 0; i < arr.length; i++) {
			const hours = arr[i]
			items.push({
				text: `${hours / 24} day${hours !== 24 ? 's' : ''}`,
				icon: allIonicIcons.timeOutline,
				color: 'primary',
				textcolor: 'primary',
				handler: async () => {
					data[entity] = hours
				},
			})
		}
		const result = await dropdownmenu(e, items)

	}
	const getBackupLocationName = (id: string) => {
		if (!id) return 'Not enabled'
		for (let i = 0; i < streaming_backup_sites.length; i++) {
			const streaming_backup_site = streaming_backup_sites[i]
			if (streaming_backup_site.id === id) return streaming_backup_site.name
		}
		return 'Not enabled'
	}
    const applyChanges = async () => {
        // update-streaming-backup-settings
        try {
            const { data: changeData, error: changeError } = 
            await pb.send(`/update-streaming-backup-settings`, {
				method: 'POST',
				body: {
					instance_id: project_instance.id,
					data
				},
			})
            if (changeError) {
                console.error('changeError', changeError)
                toast('Error updating streaming backup settings', 'danger')
                return
            } else {
                if (changeData?.json?.data === 'OK') {
                    toast('Streaming backup settings updated', 'success')
                    project_instance.db_streaming_backup_location = data.db_streaming_backup_location;
                    project_instance.logs_streaming_backup_location = data.logs_streaming_backup_location;
                    project_instance.db_streaming_backup_retention = data.db_streaming_backup_retention; 
                    project_instance.logs_streaming_backup_retention = data.logs_streaming_backup_retention;                    
                } else {
                    toast(changeData?.json?.data, 'danger')
                }
            }
        }
        catch (err) {
            console.error("ERROR", err)
        }

    }
    const dateRanges = {
        "data": { min: '', max: ''},
        "logs": { min: '', max: ''}
    }
    const getBackupGenerations = async (db: string) => {
        const { data, error } = await pb.send(`/get-litestream-generations`, {
            method: 'POST',
            body: {
                instance_id: project_instance.id,
                db
            },
        });
        if (error) {
            console.error('getBackupGenerations error', error)
            return ''
        } else {
            let arr = data.split('\n');
            let o: string = '';
            for (let i = 0; i < arr.length; i++) {
                if (i > 0) {
                    const item = arr[i];                    
                    const parts = item.split(/\s+/);
                    if (parts.length > 3) {
                        const utcStartDate = parts[3];
                        const utcEndDate = parts[4];
                        // convert utc to local
                        const startDate = moment.utc(utcStartDate).local().format('YYYY-MM-DD hh:mm:ss A');
                        const endDate = moment.utc(utcEndDate).local().format('YYYY-MM-DD hh:mm:ss A');
                        const sDate = moment.utc(startDate).toISOString();
                        const eDate = moment.utc(endDate).toISOString();
                        o += startDate + ' - ' + endDate + '\n';
                        // set min and max dateRanges for db
                        if (dateRanges[db].min === '') dateRanges[db].min = sDate;
                        if (dateRanges[db].max === '') dateRanges[db].max = eDate;
                        if (sDate < dateRanges[db].min) dateRanges[db].min = sDate;
                        if (eDate > dateRanges[db].max) dateRanges[db].max = eDate;
                    }
                }
            }
            return o; // arr.join('\n');
        }
    }
    const restoreSettings = {
        db: '',
        min: '',
        max: '',
        selectedDate: 'latest',
        destination: 'backup-folder',
    }
    const startRestore = async (db: string) => {
        const restoreGrid = document.getElementById('restoreGrid');
        const regularGrid = document.getElementById('regularGrid');
        if (restoreGrid && regularGrid) {
            restoreGrid.style.display = 'block';
            regularGrid.style.display = 'none';
            restoreSettings.db = db;
            restoreSettings.min = dateRanges[db].min;
            restoreSettings.max = dateRanges[db].max;
        }
    }
    const executeRestore = async () => {
        let utcSelectedDate;
        // check to see if restoreSettings.selectedDate is a valid date string
        if (restoreSettings.selectedDate !== 'latest') {
            const d = new Date(restoreSettings.selectedDate);
            if (isNaN(d.getTime())) {
                toast('Invalid date', 'danger')
                restoreSettings.selectedDate = restoreSettings.max;
                return;
            }
            // convert selectedDate to utc
            utcSelectedDate = moment.utc(restoreSettings.selectedDate).toISOString();
        } else {
            utcSelectedDate = 'latest';
        }

        const { data, error } = await pb.send(`/pitr`, {
            method: 'POST',
            body: {
                instance_id: project_instance.id,
                db: restoreSettings.db,
                timestamp: utcSelectedDate,
                mode: restoreSettings.destination
            },
        });
        if (error) {
            toast(error, 'danger')
        } else {
            toast('Retore completed', 'success')
            window.history.back();
        }
    }
    let restoreFromLatest = true;
    const toggleLatest = (e: any) => {
        restoreFromLatest = e.detail.checked;
        if (restoreFromLatest) {
            restoreSettings.selectedDate = 'latest';
        } else {
            restoreSettings.selectedDate = restoreSettings.max
        }
    }
    const selectDateChange = (e: any) => {
        restoreSettings.selectedDate = e.detail.value;
    }
    const changemode = (e: any) => {
        restoreSettings.destination = e.detail.value;
        
    }
</script>
<IonPage {ionViewWillEnter}>
	<ion-header>
		<ion-toolbar color="secondary">
			<ion-buttons slot="start">
				<ion-button on:click={back}>
					<ion-icon slot="icon-only" icon={arrowBackOutline} />
				</ion-button>
			</ion-buttons>
			<ion-title>Streaming Backups</ion-title>
        </ion-toolbar>
	</ion-header>
<ion-grid id="restoreGrid"  class="ion-padding Grid" style="display: none; height: 100%;overflow-x: scroll;">

    <ion-row>
        <ion-col size={"6"}>
            <div style="padding-top:5px;">
            Restore from latest backup 
            </div>
        </ion-col>
        <ion-col size={"6"}>
            <ion-toggle checked={true} color="primary" on:ionChange={toggleLatest} />
        </ion-col>
    </ion-row>

    {#if !restoreFromLatest}
    <ion-row>
        <ion-col size={"3"}>
            Min:
        </ion-col>
        <ion-col size={"9"}>
            <div style="padding-left: 10px;">
            {restoreSettings.min}
            </div>
        </ion-col>
    </ion-row>
    <ion-row>
        <ion-col size={"3"}>
            <div style="padding-top: 15px;">
            Restore to:
            </div>
        </ion-col>
        <ion-col size={"9"}>
            <ion-input class="loginInputBoxWithIcon" style="--padding-start: 10px;width: 225px;"
            on:ionInput={selectDateChange} value={restoreSettings.selectedDate} type="text"></ion-input>
        </ion-col>
    </ion-row>
    <ion-row>
        <ion-col size={"3"}>
            Max:
        </ion-col>
        <ion-col size={"9"}>
            <div style="padding-left: 10px;">
                {restoreSettings.max}
            </div>
        </ion-col>
    </ion-row>
    {/if}

    <!-- <ion-row>
        <ion-col style="background-color: var(--ion-color-dark);color: var(--ion-color-dark-contrast)">
            <ion-label>Restore to point-in-time:</ion-label></ion-col>
    </ion-row>
    <ion-row>
        <ion-col>{restoreSettings.selectedDate}</ion-col>
    </ion-row>
    <ion-row>
        <ion-col>
            <ion-datetime on:ionChange={selectDate} value={restoreSettings.max} min={restoreSettings.min} max={restoreSettings.max}></ion-datetime>
        </ion-col>
    </ion-row> -->


    <ion-row>
        <ion-col style="background-color: var(--ion-color-dark);color: var(--ion-color-dark-contrast)">
            <ion-label style="padding-left: 50px;">Restore option:</ion-label>
        </ion-col>
    </ion-row>
    <ion-row>
        <ion-col>
            <ion-radio-group on:ionChange={changemode} value={restoreSettings.destination}>
                <ion-item>
                    <ion-label>Create new entry in backups folder</ion-label>
                    <ion-radio slot="start" value="backup-folder"></ion-radio>
                </ion-item>
                <ion-item>
                    <ion-label>Backup and overwrite existing database</ion-label>
                    <ion-radio slot="start" value="backup-overwrite"></ion-radio>
                </ion-item>
                <ion-item>
                    <ion-label>Erase and overwrite existing database</ion-label>
                    <ion-radio slot="start" value="erase-overwrite"></ion-radio>
                </ion-item>
        </ion-col>
    </ion-row>
    <ion-row>
        <ion-col>
            <ion-button
                size="small"                
                expand="block"
                color="danger"
                on:click={executeRestore}
            >
                Start restore from {restoreSettings.selectedDate}
            </ion-button>
        </ion-col>
    </ion-row>
</ion-grid>

<ion-grid id="regularGrid" class="ion-padding Grid" style="height: 100%;overflow-x: scroll;">

<ion-row>
    <ion-col class="ion-text-center bold" style="background-color: var(--ion-color-dark); color: var(--ion-color-dark-contrast)">
        <ion-label>Streaming Backup Settings</ion-label>
    </ion-col>
</ion-row>
<ion-row>
    <ion-col class="ion-text-center">
        <ion-text>Automatic continuous streaming backups to durable S3 storage with PITR (point in time recovery).
        </ion-text>
    </ion-col>
</ion-row>
<ion-row>
    <ion-col class="ion-text-right bold" style="justify-content: right;display: flex;align-items: center;">
        <ion-label>Database</ion-label>
    </ion-col>
    <ion-col>
        <ion-button size="small" color="secondary" expand="block" on:click={(e) => {chooseStreamingBackupLocation(e, 'db_streaming_backup_location')}}>
            {getBackupLocationName(data.db_streaming_backup_location)}
        </ion-button>
    </ion-col>
</ion-row>
<ion-row>
    <ion-col class="ion-text-right bold" style="justify-content: right;display: flex;align-items: center;">
        <ion-label>Database Retention</ion-label>
    </ion-col>
    <ion-col>
        <ion-button size="small" color="secondary" expand="block" on:click={(e) => {chooseStreamingBackupRetention(e, 'db_streaming_backup_retention')}}>
            {(data.db_streaming_backup_retention || 0) / 24} {`day${data.db_streaming_backup_retention !== 24 ? 's' : ''}`}
        </ion-button>
    </ion-col>
</ion-row>
<ion-row>
    <ion-col class="ion-text-right bold" style="justify-content: right;display: flex;align-items: center;">
        <ion-label>Logs</ion-label>
    </ion-col>
    <ion-col>
        <ion-button size="small" color="secondary" expand="block" on:click={(e) => {chooseStreamingBackupLocation(e, 'logs_streaming_backup_location')}}>
            {getBackupLocationName(data.logs_streaming_backup_location)}
        </ion-button>
    </ion-col>
</ion-row>
<ion-row>
    <ion-col class="ion-text-right bold" style="justify-content: right;display: flex;align-items: center;">
        <ion-label>Logs Retention</ion-label>
    </ion-col>
    <ion-col>
        <ion-button size="small" color="secondary" expand="block" on:click={(e) => {chooseStreamingBackupRetention(e, 'logs_streaming_backup_retention')}}>
            {(data.logs_streaming_backup_retention || 0) / 24} {`day${data.logs_streaming_backup_retention !== 24 ? 's' : ''}`}
        </ion-button>
    </ion-col>
</ion-row>
{#if project_instance.db_streaming_backup_location !== data.db_streaming_backup_location || 
     project_instance.logs_streaming_backup_location !== data.logs_streaming_backup_location || 
     project_instance.db_streaming_backup_retention !== data.db_streaming_backup_retention || 
     project_instance.logs_streaming_backup_retention !== data.logs_streaming_backup_retention}
    <ion-row>
        <ion-col>
            <ion-button
                size="small"                
                expand="block"
                color="danger"
                on:click={applyChanges}
            >
                Apply Changes
            </ion-button>
        </ion-col>
    </ion-row>
{/if}
{#if project_instance.db_streaming_backup_location}
<ion-row style="background-color: var(--ion-color-dark);color: var(--ion-color-dark-contrast)">
    <ion-col size={"10"}><ion-label>data.db: available backups</ion-label>
        </ion-col>
        <ion-col size={"2"} class="ion-text-right">
        <ion-buttons>
            <ion-button on:click={updateDataGenerations} size="small" fill="clear"><ion-icon color="light" slot="icon-only" icon={refreshOutline}></ion-icon></ion-button>
            <ion-button on:click={()=>{startRestore('data')}} size="small" fill="clear"><ion-icon color="light" slot="icon-only" icon={cloudDownloadOutline}></ion-icon></ion-button>
        </ion-buttons>
        </ion-col>
</ion-row>
<ion-row>
    <ion-col>
        <pre id="data-generations">
        </pre>
    </ion-col>
</ion-row>
{/if}
{#if project_instance.logs_streaming_backup_location}
<ion-row style="background-color: var(--ion-color-dark);color: var(--ion-color-dark-contrast)">
    <ion-col size={"10"}><ion-label>logs.db: available backups</ion-label>
        </ion-col>
        <ion-col size={"2"} class="ion-text-right">
        <ion-buttons>
            <ion-button on:click={updateLogsGenerations} size="small" fill="clear"><ion-icon color="light" slot="icon-only" icon={refreshOutline}></ion-icon></ion-button>
            <ion-button on:click={()=>{startRestore('logs')}} size="small" fill="clear"><ion-icon color="light" slot="icon-only" icon={cloudDownloadOutline}></ion-icon></ion-button>
        </ion-buttons>
        </ion-col>
</ion-row>
<ion-row>
    <ion-col>
        <pre id="logs-generations">
        </pre>
    </ion-col>
</ion-row>
{/if}
</ion-grid>
<!-- <ion-row>
    <ion-col><ion-button on:click={() => {getBackupGenerations('data')}}>get db generations</ion-button></ion-col>
</ion-row>
<ion-row>
    <ion-col><ion-button on:click={() => {getBackupGenerations('logs')}}>get logs generations</ion-button></ion-col>
</ion-row> -->

</IonPage>