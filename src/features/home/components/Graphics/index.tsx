"use client"

import * as React from "react"
import { LineChart, Line, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import Image from "next/image"

// Datos con MUCHOS más "caminitos" ondulados como en Figma
const chartData = [
  { date: "2025-06-01", inmediatas: 45, privadas: 28 },
  { date: "2025-06-02", inmediatas: 47, privadas: 26 },
  { date: "2025-06-03", inmediatas: 44, privadas: 29 },
  { date: "2025-06-04", inmediatas: 48, privadas: 27 },
  { date: "2025-06-05", inmediatas: 46, privadas: 31 },
  { date: "2025-06-06", inmediatas: 52, privadas: 28 },
  { date: "2025-06-07", inmediatas: 49, privadas: 33 },
  { date: "2025-06-08", inmediatas: 55, privadas: 30 },
  { date: "2025-06-09", inmediatas: 51, privadas: 34 },
  { date: "2025-06-10", inmediatas: 58, privadas: 31 },
  { date: "2025-06-11", inmediatas: 54, privadas: 29 },
  { date: "2025-06-12", inmediatas: 61, privadas: 33 },
  { date: "2025-06-13", inmediatas: 57, privadas: 30 },
  { date: "2025-06-14", inmediatas: 63, privadas: 32 },
  { date: "2025-06-15", inmediatas: 59, privadas: 29 },
  { date: "2025-06-16", inmediatas: 66, privadas: 31 },
  { date: "2025-06-17", inmediatas: 62, privadas: 33 },
  { date: "2025-06-18", inmediatas: 68, privadas: 30 },
  { date: "2025-06-19", inmediatas: 64, privadas: 32 },
  { date: "2025-06-20", inmediatas: 70, privadas: 29 },
  { date: "2025-06-21", inmediatas: 66, privadas: 31 },
  { date: "2025-06-22", inmediatas: 72, privadas: 33 },
  { date: "2025-06-23", inmediatas: 68, privadas: 30 },
  { date: "2025-06-24", inmediatas: 74, privadas: 32 },
  { date: "2025-06-25", inmediatas: 70, privadas: 29 },
  { date: "2025-06-26", inmediatas: 76, privadas: 31 },
  { date: "2025-06-27", inmediatas: 72, privadas: 33 },
  { date: "2025-06-28", inmediatas: 78, privadas: 30 },
  { date: "2025-06-29", inmediatas: 74, privadas: 32 },
  { date: "2025-06-30", inmediatas: 64, privadas: 32 },
]

export function ChartAreaInteractive() {
  return (
    <Card className="pt-0 w-178 h-100 ml-9 mt-7 shadow-xs">
      <CardHeader className="flex items-start justify-between py-5 border-b">
        <div>
          <CardTitle className="text-base text-tertiary font-semibold mb-1">
            Reservas totales
          </CardTitle>
          <div className="text-3xl font-bold flex items-center gap-1">
            36
            <span className="text-[#61AA12] text-sm font-medium flex items-center gap-1 ml-3 mt-1">
              <Image
                src="/home/arrow-up.svg"
                alt="arrow"
                width={16}
                height={16}
              />
              100%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-6">
        <ChartContainer
          className="h-65 w-full "
          config={{
            inmediatas: {
              label: "Plazas Inmediatas",
              color: "#3B82F6", // Azul exacto de Figma
            },
            privadas: {
              label: "Plazas Privadas",
              color: "#8B5CF6", // Morado exacto de Figma
            },
          }}
        >
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
          >
            <CartesianGrid className=""
              vertical={false}
              horizontal={true}
              strokeDasharray="2 2"
              stroke="#e2e8f0"
              strokeOpacity={0.5}
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <ChartTooltip 
              cursor={{
                stroke: "#e2e8f0",
                strokeWidth: 1,
                strokeDasharray: "2 2",
              }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                  className="w-48 h-19 border border-secondary-border shadow-md text-primary font-semibold text-xs"
                />
              }
            />

            {/* Línea azul - Plazas Inmediatas */}
            <Line
              dataKey="inmediatas"
              type="natural"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                stroke: "#3B82F6",
                strokeWidth: 2,
                fill: "#ffffff",
              }}
              connectNulls={false}
            />

            {/* Línea morada - Plazas Privadas */}
            <Line
              dataKey="privadas"
              type="natural"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                stroke: "#8B5CF6",
                strokeWidth: 2,
                fill: "#ffffff",
              }}
              connectNulls={false}
            />

            <ChartLegend
              content={<ChartLegendContent />}
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
