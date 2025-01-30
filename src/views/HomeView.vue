<template>
  <div
    class="container mt-4 p-4 rounded shadow-lg"
    :class="{ 'dark-mode': isDarkMode }"
  >
    <div class="d-flex justify-content-between mb-3 align-items-center">
      <div>
        <column-toggles
          :columns="columns"
          :columnLabels="columnLabels"
          @toggle-column="toggleColumn"
        />
      </div>
      <div>
        <dark-mode-toggle
          :isDarkMode="isDarkMode"
          @toggle-dark-mode="toggleDarkMode"
        />
      </div>
    </div>

    <user-table
      :key="JSON.stringify(columns) + '_' + users.length"
      :users="users"
      :columns="columns"
      :isDarkMode="isDarkMode"
      @remove-user="removeUser"
    />
  </div>
</template>

<script>
import { getUsers } from "@/services/userService";
import ColumnToggles from "@/components/ColumnToggles.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import UserTable from "@/components/UserTable.vue";

export default {
  name: "HomeView",
  components: {
    ColumnToggles,
    DarkModeToggle,
    UserTable,
  },
  data() {
    return {
      users: [],
      columns: {
        numero: true,
        usuarioNombre: true,
        usuarioTelefono: true,
        usuarioEmail: true,
        acciones: true,
      },
      columnLabels: {
        numero: "N°",
        usuarioNombre: "Nombre",
        usuarioTelefono: "Teléfono",
        usuarioEmail: "Correo Electrónico",
        acciones: "Acciones",
      },
      isDarkMode: false,
    };
  },
  methods: {
    async fetchUsers() {
      this.users = await getUsers();
    },
    toggleColumn(key) {
      this.columns[key] = !this.columns[key];
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    },
    removeUser(index) {
      this.users.splice(index, 1);
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.dark-mode {
  background-color: #121212 !important;
  color: white;
}

.container {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
}

.dark-mode .container {
  background-color: #1e1e1e;
  color: white;
}

.btn {
  border-radius: 8px;
}

.table {
  border-radius: 8px;
  overflow: hidden;
}

.table th {
  text-transform: uppercase;
}

.dataTables_wrapper .dataTables_filter input {
  margin-left: 0.5em;
}

.dataTables_wrapper .dataTables_length select {
  margin-left: 0.5em;
}
</style>
