import Image from "next/image"
import React from "react"

const LogoRegister = () => {
  return (
    <div className="flex justify-center items-center mt-2.5">
      <Image
        src="/login/logo.svg"
        alt="logo"
        width={148}
        height={33}
      />
    </div>
  )
}

export default LogoRegister
