<template>
  <button
    @click="$emit('toggle-dark-mode')"
    class="btn btn-secondary px-4 py-2 rounded"
  >
    Modo {{ isDarkMode ? "Claro" : "Oscuro" }}
  </button>
</template>

<script>
export default {
  name: "DarkModeToggle",
  props: {
    isDarkMode: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
