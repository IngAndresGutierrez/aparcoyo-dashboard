"use client";

import { ColumnDef, RowData } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Plaza } from "../../types";
import {
  formatPublicationDate,
  formatPrice,
  getInitial,
  formatPlazaType,
} from "../../utils";

// Extender la interfaz ColumnMeta para incluir la propiedad responsive
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean;
  }
}

export const columns: ColumnDef<Plaza>[] = [
  {
    id: "select",
    header: () => <input type="checkbox" />,
    cell: () => <input type="checkbox" />,
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "direccion",
    header: "Plaza",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <Image
            src="/home/home-03.svg"
            alt="plaza"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm text-gray-900">
            {row.original.direccion}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-500 capitalize">
              {formatPlazaType(row.original.tipo)}
            </span>
          </div>
        </div>
      </div>
    ),
    // Sin meta.responsive para que siempre sea visible
  },
  {
    header: "Reservas",
    cell: () => <span className="text-sm font-medium">0</span>,
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "precio",
    header: "Precio",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatPrice(row.original.precio)}
      </span>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "createAt",
    header: "Fecha de publicación",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {formatPublicationDate(row.original.createAt)}
      </span>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "propietario",
    header: "Propietario",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {getInitial(row.original.propietario.nombre)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {row.original.propietario.nombre}
          </span>
          <span className="text-xs text-gray-500 truncate max-w-[120px]">
            {row.original.propietario.email}
          </span>
        </div>
      </div>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <span className="text-gray-700">Editar plaza</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            Eliminar plaza
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
];
