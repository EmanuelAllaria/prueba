<template>
  <div class="d-flex flex-wrap gap-2">
    <button
      v-for="(value, key) in columns"
      :key="'hide-' + key"
      v-if="value"
      class="btn btn-outline-secondary"
      @click="$emit('toggle-column', key)"
    >
      Ocultar {{ columnLabels[key] }}
    </button>

    <button
      v-for="(value, key) in columns"
      :key="'show-' + key"
      v-if="!value"
      class="btn btn-outline-secondary"
      @click="$emit('toggle-column', key)"
    >
      Mostrar {{ columnLabels[key] }}
    </button>
  </div>
</template>

<script>
export default {
  name: "ColumnToggles",
  props: {
    columns: {
      type: Object,
      default: () => ({}),
    },
    columnLabels: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>
