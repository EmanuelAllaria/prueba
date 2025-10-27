import axios from "axios";

export async function getUsers() {
  try {
    const response = await axios.get(
      "https://www.4sides.com.mx/api/prueba-tecnica/usuarios/index?results=50"
    );
    return response.data.usuarios || [];
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}
