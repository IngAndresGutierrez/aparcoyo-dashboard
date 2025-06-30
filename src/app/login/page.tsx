import ButtonGoogleLogin from "@/features/login/components/ButtonGoogle"
import FormLogin from "@/features/login/components/Inputs"

import Logo from "@/features/login/components/Logo"

const LoginPage = () => {
  return (
    <div className="flex justify-center items-center flex-col  lg:-mt-16 md:-mt-2 -mt-20">
      <Logo />
      <FormLogin />
      <ButtonGoogleLogin />
    </div>
  )
}

export default LoginPage
