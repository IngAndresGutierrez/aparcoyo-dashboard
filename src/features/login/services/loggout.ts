// services/logout.ts
export const handleLogout = async () => {
  try {
    // 1. Limpiar el token del localStorage
    localStorage.removeItem("token")
    
    // 2. Verificar que se eliminó correctamente
    console.log("✅ Token eliminado del localStorage")
    console.log(
      "✅ Verificación - Token en localStorage:", 
      localStorage.getItem("token") ? "AÚN EXISTE" : "ELIMINADO CORRECTAMENTE"
    )

    // 3. Opcional: Si tu backend requiere invalidar el token del lado del servidor
    // Puedes descomentar esto si es necesario:
    /*
    const token = localStorage.getItem("token")
    if (token) {
      try {
        await axios.post(`${BASE_URL}/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      } catch (error) {
        console.error("Error al invalidar token en servidor:", error)
        // No bloqueamos el logout del frontend por este error
      }
    }
    */

    return { success: true }
  } catch (error) {
    console.error("Error en logout:", error)
    // Incluso si hay error, intentamos limpiar el localStorage
    localStorage.removeItem("token")
    return { success: false, error: "Error en el logout" }
  }
}