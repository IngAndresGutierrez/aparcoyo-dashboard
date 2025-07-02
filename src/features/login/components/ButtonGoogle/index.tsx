"use client"

import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"

const ButtonGoogleLogin = () => {
  const handleGoogleLogin = () => {
    window.location.href = "https://aparcoyo-back.onrender.com/apa/auth/google"
  }

  return (
    <div className="w-full flex justify-center">
      <Button
        onClick={handleGoogleLogin}
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
