"use client"

import { Button } from "@/components/ui/button"
import { useGoogleLogin } from "../../hooks/useGoogleLogin"

const ButtonGoogleLogin = () => {
  const { onClickButtonLogin } = useGoogleLogin()

  const handleGoogleLoginFunction = async () => {
    onClickButtonLogin()
  }

  return (
    <div>
      <Button
        onClick={handleGoogleLoginFunction}
        className="mt-6"
      >
        Iniciar con Google
      </Button>
    </div>
  )
}

export default ButtonGoogleLogin
