<script lang="ts">
    import AccordionComponent from './AccordionComponent.svelte';
    export let node: any;
    export let paddingLeft = 0;
  </script>
  
  <AccordionComponent {node} {paddingLeft} />
  