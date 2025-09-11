"use client"

import { useState } from "react"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"
import MetricsCardsList from "@/features/users/components/MetricsCardsList"
import TotalUsersGraph from "@/features/users/components/TotalUsersGraph"
import UsersTable from "@/features/users/components/UsersTable"
import WelcomeUsers from "@/features/users/components/WelcomeUsers"
import { RangoEstadisticas } from "@/features/plazas/types/range"
import { UsuarioTabla } from "@/features/users/types/table"

// 🔥 NUEVA INTERFAZ para estadísticas calculadas
interface EstadisticasCalculadas {
  usuariosTotales: number
  usuariosActivos: number
  usuariosConPlaza: number
  usuariosNuevos: number
  usuariosConReserva: number
  periodoActual: number
  periodoAnterior: number
}

const UsersPage = () => {
  // ESTADO CENTRALIZADO
  const [rango, setRango] = useState<RangoEstadisticas>("mes")
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UsuarioTabla[]>([])
  const [searchTerm] = useState("")
  const [estadoFilter] = useState<
    "activo" | "inactivo" | "suspendido" | undefined
  >(undefined)

  // MANEJADOR DEL CAMBIO DE RANGO
  const handleRangoChange = (newRango: RangoEstadisticas) => {
    console.log(`📊 Cambio de período: ${rango} → ${newRango}`)
    setRango(newRango)
  }

  // NUEVA FUNCIÓN: Recibir usuarios filtrados de WelcomeUsers
  const handleUsuariosChange = (usuarios: UsuarioTabla[]) => {
    console.log("📊 Usuarios filtrados recibidos:", usuarios.length)
    setUsuariosFiltrados(usuarios)
  }

  // 🔥 NUEVA FUNCIÓN: Calcular estadísticas desde usuarios filtrados
  const calcularEstadisticas = (): EstadisticasCalculadas => {
    if (usuariosFiltrados.length === 0) {
      return {
        usuariosTotales: 0,
        usuariosActivos: 0,
        usuariosConPlaza: 0,
        usuariosNuevos: 0,
        usuariosConReserva: 0,
        periodoActual: 0,
        periodoAnterior: 0,
      }
    }

    const now = new Date()
    const tresDiasAtras = new Date()
    tresDiasAtras.setDate(now.getDate() - 3)

    // Calcular diferentes métricas
    const usuariosTotales = usuariosFiltrados.length
    const usuariosActivos = usuariosFiltrados.filter((u) => u.isActive).length
    const usuariosConPlaza = usuariosFiltrados.filter(
      (u) => (u.plazasPublicadas || 0) > 0
    ).length
    const usuariosConReserva = usuariosFiltrados.filter(
      (u) => (u.reservasHechas || 0) > 0
    ).length

    // Usuarios nuevos (registrados en los últimos 3 días)
    const usuariosNuevos = usuariosFiltrados.filter((u) => {
      if (!u.fechaRegistro) return false
      const fechaRegistro = new Date(u.fechaRegistro)
      return fechaRegistro >= tresDiasAtras
    }).length

    // Para el crecimiento, usar una estimación simple
    // En una implementación real, necesitarías datos del período anterior
    const periodoActual = usuariosTotales
    const periodoAnterior = Math.max(1, Math.floor(usuariosTotales * 0.85)) // Simular 15% de crecimiento

    console.log("📊 Estadísticas calculadas:", {
      usuariosTotales,
      usuariosActivos,
      usuariosConPlaza,
      usuariosNuevos,
      usuariosConReserva,
      periodoActual,
      periodoAnterior,
    })

    return {
      usuariosTotales,
      usuariosActivos,
      usuariosConPlaza,
      usuariosNuevos,
      usuariosConReserva,
      periodoActual,
      periodoAnterior,
    }
  }

  // Calcular estadísticas actuales
  const estadisticas = calcularEstadisticas()

  return (
    <AppSidebarDashboard>
      {/* HEADER CON SELECT DINÁMICO */}
      <div className="mt-7">
        <WelcomeUsers
          rango={rango}
          onRangoChange={handleRangoChange}
          onUsuariosChange={handleUsuariosChange}
        />
      </div>

      {/* MÉTRICAS - AHORA CON DATOS CALCULADOS */}
      <div className="mt-5">
        <MetricsCardsList
          rango={rango}
          estadisticasCalculadas={estadisticas} // 🔥 Nueva prop
        />
      </div>

      {/* GRÁFICO - AHORA CON DATOS CALCULADOS */}
      <div className="mt-5 flex-1/3">
        <TotalUsersGraph
          rango={rango}
          estadisticasCalculadas={estadisticas} // 🔥 Nueva prop
        />
      </div>

      {/* TABLA */}
      <div className="mt-5">
        <UsersTable
          usuarios={usuariosFiltrados}
          searchTerm={searchTerm}
          estadoFilter={estadoFilter}
        />
      </div>
    </AppSidebarDashboard>
  )
}

export default UsersPage
