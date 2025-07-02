"use client"

import { Button } from "@/components/ui/button"
import { useGoogleLogin } from "../../hooks/useGoogleLogin"

import { FcGoogle } from "react-icons/fc"

const ButtonGoogleLogin = () => {
  const { onClickButtonLogin } = useGoogleLogin()

  const handleGoogleLoginFunction = async () => {
    onClickButtonLogin()
  }

  return (
    <div className="w-full flex justify-center">
      <Button
        onClick={handleGoogleLoginFunction}
        className="mt-4 w-88 h-11 gap-2 border border-input bg-white text-secondary shadow-xs rounded-full"
        variant="outline"
      >
        <FcGoogle size={20} />
        Iniciar con Google
      </Button>
    </div>
  )
}

export default ButtonGoogleLogin
