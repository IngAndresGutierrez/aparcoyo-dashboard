"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEmailLogin } from "../../hooks/useEmailLogin"

const FormLogin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [isInvalid, setIsInvalid] = useState(false)
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false)
  const [password, setPassword] = useState("")
  const { onClickEmailButtonLogin, isLoading, error } = useEmailLogin(
    email,
    password
  )

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setIsInvalid(value.length > 0 && !validateEmail(value))
  }

  const handleLogin = () => {
    setHasAttemptedLogin(true)

    const isEmailValid = validateEmail(email)
    const isPasswordValid = password.length >= 6

    if (isEmailValid && isPasswordValid) {
      onClickEmailButtonLogin()
    }
  }

  return (
    <div className="space-y-4 mt-6 ">
      {/* Logo arriba (mantenlo si ya lo tienes en otra parte) */}

      {/* Título */}
      <h1 className="text-3xl font-bold text-primary text-center">
        {hasAttemptedLogin ? "Bienvenido de vuelta" : "Iniciar sesión"}
      </h1>

      {/* Subtítulo solo en la primera vista */}
      {!hasAttemptedLogin && (
        <p className="text-base text-tertiary text-center mb-4 font-normal">
          Bienvenido al panel administrativo de AparcoYo
        </p>
      )}

      {error && (
        <div className="flex items-start mt-6  bg-[#FEF3F2] border border-[#FDA29B] p-4 w-88 h-24 rounded-xl">
          <Image
            src="/login/alert-circle.svg"
            alt="Error"
            width={25}
            height={25}
            className="mt-1"
          />
          <div className="w-88 h-20 p-3 -mt-2">
            <p className="text-sm font-semibold text-primary">
              Usuario o contraseña incorrectos
            </p>
            <p className="text-sm text-tertiary">
              Verifica tus credenciales e inténtalo de nuevo.
            </p>
          </div>
        </div>
      )}

      <div className="w-88 mt-7">
        {/* Label */}
        <p className="text-secondary text-sm font-medium mb-1">Email</p>

        {/* Input con icono de error */}
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full rounded-md px-4 shadow-xs pr-10 py-2 h-11 focus:outline-none focus:ring-0 text-base
            ${isInvalid ? "border border-[#FDA29B]" : "border border-[#D5D7DA]"}
          `}
          />
          {isInvalid && (
            <Image
              src="/login/alert-circle.svg"
              alt="Alerta"
              width={20}
              height={20}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            />
          )}
        </div>

        {/* Mensaje de error */}
        {isInvalid && (
          <p className="mt-1 text-sm text-error-primary font-normal">
            Este email no es válido.
          </p>
        )}
      </div>
      {/* Label */}
      <label className="text-secondary font-medium text-sm block mb-1 mt-5">
        Contraseña
      </label>

      {/* Input + Button juntos */}
      <div className="flex items-center w-88 border border-[#D5D7DA]  focus:outline-none focus:ring-0 rounded-md overflow-hidden">
        <input  
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña"
          className="flex-1 px-3 py-2 shadow-xs text-base bg-transparent outline-none  h-11 text-placeholder  focus:outline-none focus:ring-0"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          className="rounded-none border-l border-border px-4 text-secondary text-sm font-medium h-11"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "Ocultar" : "Mostrar"}
        </Button>
      </div>
      <div>
        <div className="flex justify-center  items-center gap-2 md:flex-row ">
          <Button
            className="bg-brand-solid rounded-full w-88 h-11 text-white font-bold text-base cursor-pointer"
            onClick={handleLogin}
            disabled={isLoading || !email || password.length < 6}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FormLogin
