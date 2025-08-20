/* eslint-disable @typescript-eslint/no-explicit-any */
// features/edit-plazas/components/PlazaDetails.tsx
"use client"

import { useState } from "react"
import { MapPin, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import ModalDetallesPlaza from "../ModalEditPlaza"
// Importar el modal - asegúrate de que la ruta sea correcta

// Si el error persiste, verifica la ruta:
// import ModalDetallesPlaza from "../components/ModalDetallesPlaza"
// import ModalDetallesPlaza from "@/features/edit-plazas/components/ModalDetallesPlaza"

// Tipo para los datos de la plaza
interface PlazaDetailsData {
  id: string
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
  // Props para cuando se conecte al backend
  plazaId: string
  plazaData?: PlazaDetailsData
  onEditar?: () => void
}

function PlazaDetails({ plazaId, plazaData, onEditar }: PlazaDetailsProps) {
  // Estado para controlar si se muestra la descripción completa
  const [mostrarCompleto, setMostrarCompleto] = useState(false)

  // Estado para el modal
  const [modalAbierto, setModalAbierto] = useState(false)

  // Datos hardcodeados por ahora - se reemplazarán con props del backend
  const plaza: PlazaDetailsData = plazaData || {
    id: plazaId || "plaza-001",
    descripcion:
      "Plaza de aparcamiento segura en el barrio de Mayfair, a pocos minutos andando de Oxford Street y Regent Street. Aparcamiento abierto las 24 horas, todos los días",
    descripcionCompleta:
      "Plaza de aparcamiento segura en el barrio de Mayfair, a pocos minutos andando de Oxford Street y Regent Street. Aparcamiento abierto las 24 horas, todos los días. Cuenta con sistema de seguridad las 24 horas, cámaras de vigilancia y personal de seguridad. Acceso fácil desde las principales vías de Londres. Ideal para compras, turismo y actividades de negocios en el centro de Londres.",
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

  // Función para manejar la edición
  const handleEditar = () => {
    setModalAbierto(true)

    if (onEditar) {
      onEditar()
    }
    console.log("Editar detalles de plaza:", plaza.id)
  }

  // Función para manejar el éxito del modal
  const handleModalSuccess = () => {
    console.log("Plaza actualizada exitosamente!")
    // Aquí podrías agregar lógica para refrescar los datos
    // o mostrar una notificación de éxito
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
            >
              Editar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
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
            {modalAbierto ? "Abierto" : "Cerrado"}
          </div>
        </CardContent>
      </Card>

      {/* Modal integrado */}
      {/* Modal integrado - solo renderizar cuando esté abierto */}
      {modalAbierto && (
        <ModalDetallesPlaza
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          plazaId={plazaId}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  )
}

export default PlazaDetails
