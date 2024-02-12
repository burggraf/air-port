<script lang="ts">
	import { codeWorkingOutline, easelOutline, folderOpenOutline, hammerOutline, personOutline, serverOutline } from 'ionicons/icons'
    import AccordionWrapper from './AccordionWrapper.svelte';
    export let node: any;
    export let paddingLeft = 0;
    const getColor = (paddingLeft: number) => {
        switch (paddingLeft) {
            case 0:
                return 'dark';
            case 20:
                return 'medium';
            case 40:
                return 'light';
            default:
                return 'light';
        }
    };
    const getIcon = (title: string, children: number) => {
        switch (title) {
            case 'pb_data':
                return serverOutline;
            case 'pb_migrations':
                return codeWorkingOutline;
            case 'pb_public':
                return easelOutline;
            case 'pb_hooks':
                return hammerOutline;
            default:
                return children > 0 ? folderOpenOutline : null;
        }
    };
  </script>
  
  <ion-accordion value={node.title}>
    <ion-item slot="header" color={getColor(paddingLeft)} style={`padding-left: ${paddingLeft}px;`}>
      <ion-icon slot="start" icon={getIcon(node.title, node.children?.length)} />
      <ion-label>{node.title}</ion-label>
    </ion-item>
  
    <div slot="content">
      {#if node.children && node.children.length > 0}
        <ion-accordion-group>
          {#each node.children as childNode}
            <AccordionWrapper node={childNode} paddingLeft={paddingLeft + 20} />
          {/each}
        </ion-accordion-group>
      {:else}
          <div class="ion-padding" style={`margin-left:${paddingLeft}px;`}>
             Content for {node.title}
          </div>
      {/if}
    </div>
  </ion-accordion>
  

