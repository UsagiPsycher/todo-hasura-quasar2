<template>
  <q-page class="row items-center justify-evenly">
    <card-component
      title="Todo component"
    ></card-component>
  </q-page>
</template>

<script lang="ts">
import CardComponent from 'components/CompositionComponent.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  components: { CardComponent },
  setup() {
    return { };
  }
});
</script>
