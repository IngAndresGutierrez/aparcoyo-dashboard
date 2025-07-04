import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import Image from "next/image"

const reports = [
  {
    report:
      "“Me habló con groserías y me insultó cuando le pedí que se moviera un poco.”",
    date: "Jan 16, 2025",
    status: "Pendiente",
    category: "Contenido falso o engañoso",
    user: {
      name: "Sienna Hewitt",
      email: "hi@siennahewitt.com",
      avatar: "/avatars/avatar1.jpg",
    },
  },
  {
    report:
      "“El usuario no era el mismo que aparecía en la reserva, parecía alguien diferente.”",
    date: "Jan 16, 2025",
    status: "Pendiente",
    category: "Ubicación incorrecta o inexistente",
    user: {
      name: "Pippa Wilkinson",
      email: "pippa@pippaw.com",
      avatar: "/avatars/avatar2.jpg",
    },
  },
  {
    report: "“Me dijo que si no le pagaba por fuera, no me dejaba aparcar.”",
    date: "Jan 15, 2025",
    status: "Pendiente",
    category: "Lenguaje ofensivo o inapropiado",
    user: {
      name: "Olly Schroeder",
      email: "olly_s@icloud.com",
      avatar: "/avatars/avatar3.jpg",
    },
  },
  {
    report: "“Me mandó muchos mensajes sin sentido, parecía spam.”",
    date: "Jan 14, 2025",
    status: "Pendiente",
    category: "Contenido falso o engañoso",
    user: {
      name: "Mathilde Lewis",
      email: "mathilde@hey.com",
      avatar: "/avatars/avatar4.jpg",
    },
  },
  {
    report: "“Intentó coquetearme y me hizo sentir incómoda.”",
    date: "Jan 14, 2025",
    status: "Pendiente",
    category: "Contenido inapropiado o explícito",
    user: {
      name: "Julius Vaughan",
      email: "juliusvaughan@gmail.com",
      avatar: "/avatars/avatar5.jpg",
    },
  },
  {
    report:
      "“Me insistió varias veces para cancelar la reserva y pagarle en efectivo.”",
    date: "Jan 14, 2025",
    status: "Pendiente",
    category: "Spam o mensajes irrelevantes",
    user: {
      name: "Zaid Schwartz",
      email: "zaid@zaidstudio.com",
      avatar: "/avatars/avatar6.jpg",
    },
  },
]

const TableReports = () => {
  return (
    <div className="w-239 shadow-xs border rounded-xl  ml-9 mt-8 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <h2 className="text-base font-semibold">18 Reportes recibidos</h2>
      </div>

      {/* Tabla sin scroll */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%] text-quaternary text-xs">
              Reporte
            </TableHead>
            <TableHead className="w-[12%] text-quaternary text-xs">
              <div className="flex items-center gap-1">
                <span>Fecha</span>
                <Image
                  src="/home/selector-vertical.svg"
                  alt="selector"
                  width={12}
                  height={12}
                />
              </div>
            </TableHead>

            <TableHead className="w-[10%] text-quaternary text-xs">
              <div className="flex items-center gap-1">
                <span>Estado</span>
                <Image
                  src="/home/selector-vertical.svg"
                  alt="selector"
                  width={12}
                  height={12}
                />
              </div>
            </TableHead>

            <TableHead className="w-[20%] text-quaternary text-xs">
              <div className="flex items-center gap-1">
                <span>Categoría</span>
                <Image
                  src="/home/selector-vertical.svg"
                  alt="selector"
                  width={12}
                  height={12}
                />
              </div>
            </TableHead>

            <TableHead className="w-[23%] text-quaternary text-xs">
              <div className="flex items-center gap-1">
                <span>Reservado por</span>
                <Image
                  src="/home/selector-vertical.svg"
                  alt="selector"
                  width={12}
                  height={12}
                />
              </div>
            </TableHead>

            <TableHead className="w-[5%] text-quaternar text-xs"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="text-sm whitespace-normal leading-5 p-2">
                {item.report}
              </TableCell>
              <TableCell className="text-sm">{item.date}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  className="bg-orange-50 text-orange-500 hover:bg-orange-100 text-sm font-medium rounded-full border border-orange-100"
                >
                  {item.status}
                </Button>
              </TableCell>
              <TableCell className="text-sm whitespace-normal leading-5">
                {item.category}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image
                    src={item.user.avatar}
                    alt={item.user.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.user.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-red-500">
                      Eliminar reporte
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Botón inferior */}
      <div className="px-4 pb-4 pt-3">
        <Button
          variant="outline"
          className="h-9 px-4 py-2 text-sm font-medium rounded-full border border-[#D0D5DD] shadow-sm"
        >
          Ver todos los reportes
        </Button>
      </div>
    </div>
  )
}

export default TableReports
