import InputDemo from "@/features/login/components/Inputs"
import Logo from "@/features/login/components/Logo"

const LoginPage = () => {
  return (
    <div className="flex justify-center items-center flex-col  lg:-mt-16 md:-mt-2 -mt-20">
      <Logo />
      <InputDemo />
    </div>
  )
}

export default LoginPage
