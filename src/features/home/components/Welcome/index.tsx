import { Button } from "@/components/ui/button"
import React from "react"

const Welcome = () => {
  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Bienvenida, Kate</h1>

      <div className="flex flex-row gap-3 mt-4 ">
        <Button
          variant="outline"
          className="w-46 h-9 rounded-full"
        >
          Button1
        </Button>
        <Button
          variant="outline"
          className="w-46 h-9 rounded-full"
        >
           Button2
        </Button>
      </div>
    </div>
  )
}

export default Welcome
