"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React, { useState } from "react"

const RegisterForm = () => {
  const [rol, setRol] = useState("")
  const [errors, setErrors] = useState({ general: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    const data = {
      rol: formData.get("rol")?.toString().trim(),
      documento: formData.get("documento")?.toString().trim(),
      nombre: formData.get("nombre")?.toString().trim(),
      telefono: formData.get("telefono")?.toString().trim(),
      email: formData.get("email")?.toString().trim(),
      password: formData.get("password")?.toString().trim(),
      direccion: formData.get("direccion")?.toString().trim(),
      isActive: true,
    }

    const camposVacios = Object.values(data).some((v) => v === "" || v === undefined)

    if (camposVacios) {
      setErrors({ general: "Todos los campos son obligatorios." })
      return
    }

    setErrors({ general: "" })
    console.log("Datos a enviar:", data)
    // Aquí va tu lógica de envío con fetch/axios
  }

  return (
    <div className="flex justify-center items-center flex-col p-6">
      <h1 className="text-3xl font-bold text-primary mb-2 -mt-1">Regístrate</h1>
      <p className="mb-4 text-tertiary font-normal text-base">
        Bienvenido, acá te puedes registrar
      </p>

      <form
        className="grid grid-cols-2 gap-4 w-full max-w-4xl"
        onSubmit={handleSubmit}
      >
        {/* ROL */}
        <div>
          <Label className="mb-2 text-secondary" htmlFor="rol">
            Rol
          </Label>
          <Select
            name="rol"
            onValueChange={(value: React.SetStateAction<string>) => setRol(value)}
          >
            <SelectTrigger className="w-full h-11 text-placeholder focus-visible:ring-0">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Paciente">Paciente</SelectItem>
              <SelectItem value="Terapeuta">Terapeuta</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="rol" value={rol} />
        </div>

        {/* DOCUMENTO */}
        <div>
          <Label className="mb-2 text-secondary" htmlFor="documento">
            Documento
          </Label>
          <input
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
            id="documento"
            name="documento"
            placeholder="Ej: 123456789"
          />
        </div>

        {/* NOMBRE */}
        <div>
          <Label className="mb-2 text-secondary" htmlFor="nombre">
            Nombre
          </Label>
          <input
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
            id="nombre"
            name="nombre"
            placeholder="Ej: Alejandro Gutiérrez"
          />
        </div>

        {/* TELÉFONO */}
        <div>
          <Label className="mb-2 text-secondary" htmlFor="telefono">
            Teléfono
          </Label>
          <input
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
            id="telefono"
            name="telefono"
            placeholder="Ej: +57 3000000000"
          />
        </div>

        {/* EMAIL */}
        <div>
          <Label className="mb-2 text-secondary" htmlFor="email">
            Email
          </Label>
          <input
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
            id="email"
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
          />
        </div>

        {/* CONTRASEÑA */}
        <div>
          <Label className="mb-2 text-secondary" htmlFor="password">
            Contraseña
          </Label>
          <input
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
            id="password"
            name="password"
            type="password"
            placeholder="Tu contraseña"
          />
        </div>

        {/* DIRECCIÓN */}
        <div className="col-span-2">
          <Label className="mb-2 text-secondary" htmlFor="direccion">
            Dirección
          </Label>
          <input
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
            id="direccion"
            name="direccion"
            placeholder="Calle 123 #45-67"
          />
        </div>

        {/* MENSAJE DE ERROR */}
        {errors.general && (
          <p className="col-span-2 text-sm text-red-500 mt-2 text-right">
            {errors.general}
          </p>
        )}

        {/* BOTÓN */}
        <div className="col-span-2 flex justify-end">
          <Button
            type="submit"
            className="bg-brand-solid text-white px-6 py-2 rounded-md transition w-101 h-11 mt-1 cursor-pointer"
          >
            Registrarse
          </Button>
        </div>
      </form>
    </div>
  )
}

export default RegisterForm
