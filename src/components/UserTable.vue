<template>
  <div>
    <div class="table-responsive">
      <table
        ref="userTable"
        class="table table-hover table-bordered text-center shadow-sm display"
      >
        <thead class="table-dark">
          <tr>
            <th>#</th>
            <th>Nombre Completo</th>
            <th>Correo Electrónico</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, index) in users"
            :key="user.id"
            class="align-middle"
          >
            <td>{{ index + 1 }}</td>
            <td>
              {{ user.usuarioNombre }} {{ user.usuarioApellidoPaterno }}
              {{ user.usuarioApellidoMaterno }}
            </td>
            <td>{{ user.usuarioEmail }}</td>
            <td>{{ user.usuarioTelefono }}</td>
            <td>
              <button
                class="btn btn-danger btn-sm px-3"
                @click="removeUser(index)"
              >
                Eliminar
              </button>
              <button
                class="btn btn-primary btn-sm ms-2 px-3"
                @click="takePhoto"
              >
                📷 Tomar Foto
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <br />
    <video ref="videoElement" class="d-none"></video>
    <canvas ref="canvasElement" class="d-none"></canvas>
  </div>
</template>

<script>
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

export default {
  name: "UserTable",
  props: {
    users: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Object,
      default: () => ({}),
    },
    isDarkMode: {
      type: Boolean,
      default: false,
    },
    searchQuery: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      dataTableInstance: null,
      columnIndexMap: {
        numero: 0,
        usuarioNombre: 1,
        usuarioEmail: 2,
        usuarioTelefono: 3,
        acciones: 4,
      },
      photo: null,
    };
  },
  methods: {
    reInitDataTable() {
      if (this.dataTableInstance) {
        this.dataTableInstance.destroy();
        this.dataTableInstance = null;
      }

      this.$nextTick(() => {
        const el = this.$refs.userTable;
        if (el) {
          this.dataTableInstance = $(el).DataTable({
            pageLength: 10,
            lengthChange: true,
            dom: "lrtip",
            language: {
              url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json",
            },
            columnDefs: [
              { targets: 0, visible: this.columns.numero, orderable: false },
              { targets: 1, visible: this.columns.usuarioNombre },
              { targets: 2, visible: this.columns.usuarioEmail },
              { targets: 3, visible: this.columns.usuarioTelefono },
              { targets: 4, visible: this.columns.acciones, orderable: false },
            ],
          });
        }
      });
    },
    removeUser(index) {
      if (confirm("¿Eliminar este usuario de la tabla?")) {
        this.$emit("remove-user", index);
      }
    },
    takePhoto() {
      const video = this.$refs.videoElement;
      const canvas = this.$refs.canvasElement;

      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.play();

          setTimeout(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            this.photo = canvas.toDataURL("image/png");

            stream.getTracks().forEach((track) => track.stop());
            video.pause();
            video.srcObject = null;
            video.style.display = "none";

            this.$emit("photo-taken", this.photo);
          }, 2000);
        })
        .catch((error) => {
          console.error("Error al acceder a la cámara:", error);
        });
    },
  },
  watch: {
    users() {
      this.reInitDataTable();
    },
    searchQuery(val) {
      if (this.dataTableInstance) {
        this.dataTableInstance.search(val || "").draw();
      }
    },
    columns: {
      deep: true,
      handler() {
        if (this.dataTableInstance) {
          Object.keys(this.columns).forEach((key) => {
            const colIndex = this.columnIndexMap[key];
            if (colIndex !== undefined) {
              this.dataTableInstance
                .column(colIndex)
                .visible(this.columns[key]);
            }
          });
        }
      },
    },
  },
  mounted() {
    this.reInitDataTable();
  },
  beforeUnmount() {
    if (this.dataTableInstance) {
      this.dataTableInstance.destroy();
      this.dataTableInstance = null;
    }
  },
};
</script>
