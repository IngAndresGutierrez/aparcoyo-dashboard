import Image from "next/image"
import React from "react"

const Logo = () => {
  return (
    <div className="flex items-center justify-center">
      <Image
        className="top-0"
        src="/login/logo.svg"
        alt="logo"
        width={148}
        height={36}
      />
    </div>
  )
}

export default Logo
