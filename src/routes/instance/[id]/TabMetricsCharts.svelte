<script lang="ts">
	import moment from 'moment'
	import Chart from 'chart.js/auto'
	export let stats: any = []
	export let diskstats: any = []
	const formatDate = (timestamp: number) => moment(timestamp * 1000).format('MM/DD HH:mm')
	const formatDateWithoutTime = (timestamp: number) => moment(timestamp * 1000).format('MM/DD')
	const createChart = (
		chartType: string,
		description: string,
		labels: string[],
		datasets: any[],
		autoAdjust: boolean = true,
		chartStyle: any = 'line'
	) => {
		const canvasId = `${chartType}Chart`
		const existingChart = Chart.getChart(canvasId)
		if (existingChart) {
			existingChart.destroy()
		}

		const ctx: any = document.getElementById(canvasId)
		new Chart(ctx, {
			type: chartStyle,
			data: {
				labels: labels,
				datasets: datasets,
			},
			options: {
				scales: {
					x: {
						ticks: {
							maxRotation: 90,
							minRotation: 90,
						},
					},
					y: {
						beginAtZero: true,
						ticks: autoAdjust ? {
							// Custom callback to format ticks
							callback: function (value: any, index: any, values: any) {
								const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
								let unitIndex = 0
								while (value >= 1024 && unitIndex < units.length - 1) {
									value /= 1024
									unitIndex++
								}
								return `${value.toFixed(1)} ${units[unitIndex]}`
							},
						} : undefined,
					},
				},
			},
		})
	}

	const createCharts = () => {
		let labels = stats.map((stat: any) => formatDate(stat.ts))
		const cpu_usage = stats.map((stat: any) => stat.cpu_usage)
		let datasets = [
			{
				label: 'CPU Usage %',
				data: cpu_usage,
				borderWidth: 1,
				tension: 0.3,
			},
		]
		if (cpu_usage.length > 0) createChart('cpu', 'CPU Usage', labels, datasets, false)
		const mem_usage = stats.map((stat: any) => stat.mem_usage)
		datasets = [
			{
				label: 'Memory Usage (mb)',
				data: mem_usage,
				borderWidth: 1,
				tension: 0.3,
			},
		]
		if (mem_usage.length > 0) createChart('mem', 'Memory Usage', labels, datasets, false)
		const disk_read = stats.map((stat: any) => stat.disk_read)
		const disk_write = stats.map((stat: any) => stat.disk_write)
		datasets = [
			{
				label: 'Disk I/O IN',
				data: disk_read,
				borderWidth: 1,
				tension: 0.3,
			},
			{
				label: 'Disk I/O OUT',
				data: disk_write,
				borderWidth: 1,
				tension: 0.3,
			},
		]
		if (disk_read.length > 0 || disk_write.length > 0)
			createChart('disk', 'Disk I/O', labels, datasets)
		const net_in = stats.map((stat: any) => stat.net_in)
		const net_out = stats.map((stat: any) => stat.net_out)
		datasets = [
			{
				label: 'Net I/O IN',
				data: net_in,
				borderWidth: 1,
				tension: 0.3,
			},
			{
				label: 'Net I/O OUT',
				data: net_out,
				borderWidth: 1,
				tension: 0.3,
			},
		]
		if (net_in.length > 0 || net_out.length > 0) createChart('net', 'Network I/O', labels, datasets)
	}
	const createDiskCharts = () => {
		// ***** disk usage chart *****
		// console.log('ready to create disk usage chart', diskstats)
		const disk_usage = diskstats.map((diskstat: any) => diskstat.size)
		let disk_usage_labels = diskstats.map((diskstat: any) => formatDateWithoutTime(diskstat.ts))

		let datasets = [
			{
				label: 'Disk Usage',
				data: disk_usage,
				borderWidth: 1,
				tension: 0.3,
			},
		]
		if (disk_usage.length > 0) {
			createChart('diskusage', 'Disk Usage', disk_usage_labels, datasets, true, 'bar')
		}
	}
	// when stats changes, create the charts
	$: {
		// console.log('stats changed')
		if (stats.length > 0) createCharts()
		if (diskstats.length > 0) createDiskCharts()
	}
</script>

<ion-grid>
	<ion-row>
		<ion-col>
			<div style="width: 100%;">
				<canvas id="cpuChart" />
			</div>
		</ion-col>
		<ion-col>
			<div style="width: 100%;">
				<canvas id="memChart" />
			</div>
		</ion-col>
	</ion-row>
	<ion-row>
		<ion-col>
			<div style="width: 100%;">
				<canvas id="diskChart" />
			</div>
		</ion-col>
		<ion-col>
			<div style="width: 100%;">
				<canvas id="netChart" />
			</div>
		</ion-col>
	</ion-row>
	<ion-row>
		<ion-col>
			<div style="width: 100%;">
				<canvas id="diskusageChart" />
			</div>
		</ion-col>
		<ion-col>
			<div style="width: 100%;">&nbsp;</div>
		</ion-col>
	</ion-row>
</ion-grid>
