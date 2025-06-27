import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import React from "react"

const Welcome = () => {
  return (
    <div className="flex flex-col justify-start ml-14 mt-3">
      <p className="font-semibold text-2xl">Bienvenido, Alejo</p>
      <div className="flex flex-row mt-3.5">
        <div className="flex flex-row">
          <Card className="!w-44 !h-10 !p-0 border border-color-primary flex justify-start flex-row rounded-full">
            <Image
              className="ml-3"
              src="/home/calendar.svg"
              alt="calendar"
              width={20}
              height={20}
            />
            <div className="flex justify-center items-center -ml-5">
              <p className="font-semibold text-sm text-secondary">
                Últimos 30 días
              </p>
            </div>
            <div className="flex justify-center items-center -ml-4">
              <Button
                variant="ghost"
                className="p-0 h-auto w-auto  "
              >
                <Image
                  src="/home/arrow.svg"
                  alt="arrow"
                  width={20}
                  height={20}
                />
              </Button>
            </div>
          </Card>
        </div>
        <div>
          <div className="flex flex-row ml-1.5">
            <Card className="!w-42 !h-10 !p-0 border border-color-primary flex justify-start flex-row rounded-full">
              <Image
                className="ml-2"
                src="/home/file-download-02.svg"
                alt="calendar"
                width={20}
                height={20}
              />
              <div className="flex justify-center items-center -ml-5">
                <p className="font-semibold text-sm text-secondary">
                  Descargar reporte
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome
