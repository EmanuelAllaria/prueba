<template>
  <div class="container py-4" :class="{ 'dark-mode': isDarkMode }">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-11">
        <div class="card border-0 shadow-sm overflow-hidden">
          <div
            class="card-header bg-primary text-white d-flex align-items-center justify-content-between"
          >
            <div>
              <h5 class="mb-0">Usuarios</h5>
              <small class="text-white-50"
                >Gestiona, filtra y personaliza las columnas</small
              >
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-light btn-sm" @click="refresh">
                🔄 Refrescar
              </button>
              <button
                class="btn btn-outline-light btn-sm"
                @click="exportCsv"
                :disabled="isLoading || !users.length"
              >
                ⬇️ Exportar CSV
              </button>
              <dark-mode-toggle
                :isDarkMode="isDarkMode"
                @toggle-dark-mode="toggleDarkMode"
              />
            </div>
          </div>

          <div class="card-body">
            <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
              <div class="flex-grow-1">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Buscar por cualquier campo..."
                  v-model="searchQuery"
                  :disabled="isLoading"
                />
              </div>
              <div>
                <span class="badge bg-secondary"
                  >{{ users.length }} resultados</span
                >
              </div>
            </div>

            <div class="mb-3">
              <column-toggles
                :columns="columns"
                :columnLabels="columnLabels"
                @toggle-column="toggleColumn"
              />
            </div>

            <div
              v-if="errorMessage"
              class="alert alert-danger d-flex align-items-center"
              role="alert"
            >
              <span class="me-2">⚠️</span>
              <div>{{ errorMessage }}</div>
            </div>

            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <div class="mt-2 text-muted">Cargando usuarios...</div>
            </div>

            <div v-else>
              <user-table
                :key="JSON.stringify(columns) + '_' + users.length"
                :users="users"
                :columns="columns"
                :isDarkMode="isDarkMode"
                :searchQuery="searchQuery"
                @remove-user="removeUser"
                @photo-taken="onPhotoTaken"
              />

              <div
                v-if="!users.length && !errorMessage"
                class="alert alert-info mt-3"
                role="alert"
              >
                No hay usuarios para mostrar.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal ligero de previsualización de foto -->
    <div
      v-if="photoDataUrl"
      class="position-fixed top-0 start-0 w-100 h-100"
      style="background: rgba(0, 0, 0, 0.6); z-index: 1050"
    >
      <div class="d-flex align-items-center justify-content-center h-100 p-3">
        <div
          class="bg-white rounded shadow"
          style="max-width: 90vw; max-height: 90vh"
        >
          <div
            class="p-3 border-bottom d-flex justify-content-between align-items-center"
          >
            <strong>Foto capturada</strong>
            <button class="btn-close" @click="photoDataUrl = null"></button>
          </div>
          <div class="p-3" style="overflow: auto">
            <img :src="photoDataUrl" alt="Foto" class="img-fluid rounded" />
          </div>
          <div class="p-3 border-top d-flex justify-content-end gap-2">
            <a :href="photoDataUrl" download="foto.png" class="btn btn-primary"
              >Descargar</a
            >
            <button class="btn btn-secondary" @click="photoDataUrl = null">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
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
      isLoading: false,
      errorMessage: "",
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
      searchQuery: "",
      photoDataUrl: null,
    };
  },
  methods: {
    async fetchUsers() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        this.users = await getUsers();
      } catch (e) {
        this.errorMessage = "No se pudieron cargar los usuarios.";
      } finally {
        this.isLoading = false;
      }
    },
    toggleColumn(key) {
      this.columns[key] = !this.columns[key];
      localStorage.setItem("columns_prefs", JSON.stringify(this.columns));
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem("dark_mode", this.isDarkMode ? "1" : "0");
    },
    removeUser(index) {
      this.users.splice(index, 1);
    },
    refresh() {
      this.fetchUsers();
    },
    onPhotoTaken(dataUrl) {
      this.photoDataUrl = dataUrl;
    },
    exportCsv() {
      const q = (this.searchQuery || "").toLowerCase();
      const visibleOrder = [
        { key: "numero", label: "N°" },
        { key: "usuarioNombre", label: "Nombre Completo" },
        { key: "usuarioEmail", label: "Correo Electrónico" },
        { key: "usuarioTelefono", label: "Teléfono" },
      ].filter((c) => this.columns[c.key]);

      const filtered = this.users.filter((u) => {
        if (!q) return true;
        const fullName =
          `${u.usuarioNombre} ${u.usuarioApellidoPaterno} ${u.usuarioApellidoMaterno}`.toLowerCase();
        return (
          fullName.includes(q) ||
          String(u.usuarioTelefono || "")
            .toLowerCase()
            .includes(q) ||
          String(u.usuarioEmail || "")
            .toLowerCase()
            .includes(q)
        );
      });

      const escapeCsv = (val) => {
        const s = val == null ? "" : String(val);
        const needsQuotes =
          s.includes(",") || s.includes("\n") || s.includes('"');
        const escaped = s.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
      };

      const header = visibleOrder.map((c) => c.label).join(",");
      const rows = filtered.map((u, idx) => {
        return visibleOrder
          .map((c) => {
            switch (c.key) {
              case "numero":
                return escapeCsv(idx + 1);
              case "usuarioNombre":
                return escapeCsv(
                  `${u.usuarioNombre || ""} ${u.usuarioApellidoPaterno || ""} ${
                    u.usuarioApellidoMaterno || ""
                  }`.trim()
                );
              case "usuarioEmail":
                return escapeCsv(u.usuarioEmail || "");
              case "usuarioTelefono":
                return escapeCsv(u.usuarioTelefono || "");
              default:
                return "";
            }
          })
          .join(",");
      });

      const csv = [header, ...rows].join("\n");
      const blob = new Blob(["\ufeff", csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "usuarios.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  },
  mounted() {
    const savedDark = localStorage.getItem("dark_mode");
    if (savedDark !== null) this.isDarkMode = savedDark === "1";

    const savedCols = localStorage.getItem("columns_prefs");
    if (savedCols) {
      try {
        const parsed = JSON.parse(savedCols);
        this.columns = { ...this.columns, ...parsed };
      } catch {}
    }

    this.fetchUsers();
  },
};
</script>

<style scoped>
.dark-mode {
  background-color: #121212 !important;
  color: white;
}

.card-header {
  background-image: linear-gradient(90deg, #0d6efd, #5a8dfd);
}

.table {
  border-radius: 8px;
  overflow: hidden;
}

.table th {
  text-transform: uppercase;
}
</style>
