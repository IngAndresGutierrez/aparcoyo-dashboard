/* eslint-disable @typescript-eslint/no-explicit-any */
// features/edit-plazas/components/PlazaDetails.tsx
"use client"

import { useState, useEffect } from "react"
import { MapPin, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import useModalPlaza from "../../hooks/useEdit"
import ModalDetallesPlaza from "../ModalEditPlaza"


// Tipo para los datos de la plaza
interface PlazaDetailsData {
  id: string
  nombre: string
  descripcion: string
  descripcionCompleta?: string
  ubicacion: string
  precio: number
  propietario: {
    id: string
    nombre: string
    email: string
    avatar?: string
  }
  fechaPublicacion: string
  alturaMaxima?: string
  disponibilidad24h?: boolean
}

interface PlazaDetailsProps {
  plazaId: string
  plazaData?: PlazaDetailsData
  onEditar?: () => void
  propietarios?: Array<{
    id: string
    nombre: string
    email: string
  }>
}

function PlazaDetails({ 
  plazaId, 
  plazaData, 
  onEditar,
  propietarios = [] 
}: PlazaDetailsProps) {
  // ✅ CONEXIÓN AL BACKEND - Hook que maneja toda la lógica
  const {
    plazaData: plazaDataBackend,
    loading,
    saving,
    error,
    cargarPlaza,
    guardarCambios,
    clearError,
  } = useModalPlaza(plazaId)

  // Estados locales para UI
  const [mostrarCompleto, setMostrarCompleto] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

  // Propietarios disponibles (pueden venir por props o ser hardcodeados)
  const propietariosDisponibles = propietarios.length > 0 
    ? propietarios 
    : [
        {
          id: "prop-1",
          nombre: "Pippa Wilkinson",
          email: "pippa@pippaw.com",
        },
        {
          id: "prop-2", 
          nombre: "John Smith",
          email: "john@example.com",
        },
        {
          id: "prop-3",
          nombre: "Maria García", 
          email: "maria@example.com",
        },
      ]

  // Cargar datos de la plaza al montar el componente
  useEffect(() => {
    if (plazaId && !plazaDataBackend) {
      console.log('🔄 Cargando datos de plaza:', plazaId)
      cargarPlaza()
    }
  }, [plazaId, plazaDataBackend, cargarPlaza])

  // Datos hardcodeados como fallback para desarrollo
  const plazaFallback: PlazaDetailsData = {
    id: plazaId || "plaza-001",
    nombre: "Plaza de Mayfair",
    descripcion: "Plaza de aparcamiento segura en el barrio de Mayfair, a pocos minutos andando de Oxford Street y Regent Street. Aparcamiento abierto las 24 horas, todos los días",
    descripcionCompleta: "Plaza de aparcamiento segura en el barrio de Mayfair, a pocos minutos andando de Oxford Street y Regent Street. Aparcamiento abierto las 24 horas, todos los días. Cuenta con sistema de seguridad las 24 horas, cámaras de vigilancia y personal de seguridad. Acceso fácil desde las principales vías de Londres. Ideal para compras, turismo y actividades de negocios en el centro de Londres.",
    ubicacion: "C. de Cadaceros, 11-9",
    precio: 12,
    propietario: {
      id: "prop-1",
      nombre: "Pippa Wilkinson",
      email: "pippa@pipepw.com",
      avatar: "/avatar-placeholder.jpg",
    },
    fechaPublicacion: "Jan 16, 2025",
    alturaMaxima: "2,1 m",
    disponibilidad24h: true,
  }

  // ✅ Usar datos del backend si están disponibles, sino usar props o fallback
  const plaza: PlazaDetailsData = plazaDataBackend 
    ? {
        id: plazaDataBackend.id,
        nombre: plazaDataBackend.nombre,
        descripcion: plazaDataBackend.descripcion || "",
        descripcionCompleta: (plazaDataBackend as any).descripcionCompleta || plazaDataBackend.descripcion, // ✅ Con fallback
        ubicacion: (plazaDataBackend as any).direccion || (plazaDataBackend as any).ubicacion || "Ubicación no disponible",
        precio: typeof plazaDataBackend.precio === 'string' 
          ? parseFloat(plazaDataBackend.precio) 
          : plazaDataBackend.precio || 0,
        propietario: {
          id: plazaDataBackend.propietario?.uid || (plazaDataBackend.propietario as any)?.id || "",
          nombre: plazaDataBackend.propietario?.nombre || "Sin propietario",
          email: plazaDataBackend.propietario?.email || "",
          avatar: (plazaDataBackend.propietario as any)?.avatar,
        },
        fechaPublicacion: (plazaDataBackend as any).fechaCreacion 
          ? new Date((plazaDataBackend as any).fechaCreacion).toLocaleDateString()
          : "Fecha no disponible",
        alturaMaxima: (plazaDataBackend as any).alturaMaxima,
        disponibilidad24h: (plazaDataBackend as any).disponibilidad24h,
      }
    : (plazaData || plazaFallback)

  // ✅ Función para manejar la edición
  const handleEditar = () => {
    console.log('🖊️ Abriendo modal para editar plaza:', plazaId)
    setModalAbierto(true)

    // Cargar datos frescos del backend para el modal
    if (!plazaDataBackend) {
      cargarPlaza()
    }

    if (onEditar) {
      onEditar()
    }
  }

  // ✅ Función para manejar el guardado desde el modal
  const handleModalSave = async (formData: any) => {
    console.log('💾 Guardando cambios desde el modal:', formData)
    
    try {
      // Llamar al hook del backend para guardar
      await guardarCambios(formData)
      
      console.log('✅ Plaza actualizada exitosamente!')
      
      // Opcional: Recargar datos para reflejar cambios
      await cargarPlaza()
      
      return Promise.resolve()
    } catch (error) {
      console.error('❌ Error guardando plaza:', error)
      throw error // Re-lanzar para que el modal maneje el error
    }
  }

  // ✅ Función para manejar el éxito del modal


  // ✅ Función para reintentar carga en caso de error
  const handleRetry = () => {
    console.log('🔄 Reintentando cargar datos de plaza')
    cargarPlaza()
  }

  // Función para toggle de descripción
  const toggleDescripcion = () => {
    setMostrarCompleto(!mostrarCompleto)
  }

  // Función para formatear precio
  const formatearPrecio = (precio: number) => {
    return `€${precio}`
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Detalles de la plaza
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditar}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-medium"
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Editar'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Estados de carga y error */}
          {loading && !plazaDataBackend && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Cargando detalles de la plaza...</p>
            </div>
          )}

          {error && !plazaDataBackend && (
            <div className="text-center py-4 text-red-600">
              <p className="font-medium mb-2">Error al cargar la plaza</p>
              <p className="text-sm mb-3">{error}</p>
              <Button onClick={handleRetry} variant="outline" size="sm">
                Reintentar
              </Button>
            </div>
          )}

          {/* Contenido principal */}
          {!loading && (plaza || plazaDataBackend) && (
            <>
              {/* Nombre de la plaza */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {plaza.nombre}
                </h3>
              </div>

              {/* Descripción */}
              <div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {mostrarCompleto ? plaza.descripcionCompleta : plaza.descripcion}
                </p>
                {plaza.alturaMaxima && (
                  <p className="text-gray-700 text-sm mt-2">
                    ⚠️ Altura máxima permitida:{" "}
                    <strong>{plaza.alturaMaxima}</strong>
                  </p>
                )}

                {plaza.descripcionCompleta &&
                  plaza.descripcionCompleta !== plaza.descripcion && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleDescripcion}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto mt-2 font-medium"
                    >
                      {mostrarCompleto ? "Ver menos" : "Ver más"}
                    </Button>
                  )}
              </div>

              {/* Lista de detalles */}
              <div className="space-y-3">
                {/* Ubicación */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 text-sm">Ubicación</span>
                  </div>
                  <span className="text-gray-900 text-sm font-medium">
                    {plaza.ubicacion}
                  </span>
                </div>

                {/* Precio */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 text-sm">Precio</span>
                  <span className="text-gray-900 text-sm font-medium">
                    {formatearPrecio(plaza.precio)}
                  </span>
                </div>

                {/* Propietario */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 text-sm">Propietario</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 text-sm font-medium">
                        {plaza.propietario.nombre}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {plaza.propietario.email}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Fecha de publicación */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 text-sm">
                    Fecha de publicación
                  </span>
                  <span className="text-gray-900 text-sm font-medium">
                    {plaza.fechaPublicacion}
                  </span>
                </div>
              </div>

              {/* Debug info - remover en producción */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                <strong>Debug:</strong> Plaza ID: {plaza.id} | Precio:{" "}
                {formatearPrecio(plaza.precio)} | Modal:{" "}
                {modalAbierto ? "Abierto" : "Cerrado"} | Backend data: {plazaDataBackend ? "✅" : "❌"}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ✅ MODAL CON DATOS DEL BACKEND */}
      <ModalDetallesPlaza
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        
        // ✅ Pasar datos del backend
        plazaData={plazaDataBackend}
        loading={loading}
        saving={saving}
        error={error}
        propietarios={propietariosDisponibles}
        
        // ✅ Pasar funciones del backend
        onSave={handleModalSave}
        onRetry={handleRetry}
        onClearError={clearError}
      />
    </>
  )
}

export default PlazaDetails