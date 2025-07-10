import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

const reports = [
  {
    id: 1,
    content:
      "Me habló con groserías y me insultó cuando le pedí que se moviera un poco.",
    date: "Jan 16, 2025",
    status: "Pendiente",
    category: "Contenido falso o engañoso",
    reportedBy: {
      name: "Sienna Hewitt",
      email: "hi@siennahewitt...",
      avatar: "/home/avatar-report.svg",
    },
  },
  {
    id: 2,
    content:
      "El usuario no era el mismo que aparecía en la reserva, parecía alguien diferente.",
    date: "Jan 16, 2025",
    status: "Pendiente",
    category: "Ubicación incorrecta o inexistente",
    reportedBy: {
      name: "Piper Williamson",
      email: "pippa@pippawc...",
      avatar: "/home/avatar-report.svg",
    },
  },
  {
    id: 3,
    content: "Me dijo que si no le pagaba por fuera, no me dejaba aparcar.",
    date: "Jan 15, 2025",
    status: "Pendiente",
    category: "Lenguaje ofensivo o inapropiado",
    reportedBy: {
      name: "Olly Schroeder",
      email: "olly_s@icloud.co...",
      avatar: "/home/avatar-report.svg",
    },
  },
  {
    id: 4,
    content: "Me mandó muchos mensajes sin sentido, parecía spam.",
    date: "Jan 14, 2025",
    status: "Pendiente",
    category: "Contenido falso o engañoso",
    reportedBy: {
      name: "Mathilde Lewis",
      email: "mathilde@hey.c...",
      avatar: "/home/avatar-report.svg",
    },
  },
  {
    id: 5,
    content: "Intentó coquetearme y me hizo sentir incómoda.",
    date: "Jan 14, 2025",
    status: "Pendiente",
    category: "Contenido inapropiado o explí...",
    reportedBy: {
      name: "Julius Vaughan",
      email: "juliusvaughan@...",
      avatar: "/home/avatar-report.svg",
    },
  },
  {
    id: 6,
    content:
      "Me insistió varias veces para cancelar la reserva y no pagarle en efectivo.",
    date: "Jan 14, 2025",
    status: "Pendiente",
    category: "Spam o mensajes irrelevantes",
    reportedBy: {
      name: "Zaid Schwartz",
      email: "zaid@zaidstudio...",
      avatar: "/home/avatar-report.svg",
    },
  },
]

const TableReport = () => {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          18 Reportes recibidos
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <Table className="w-full">
          <TableHeader className="">
            <TableRow className="border-b border-gray-200">
              <TableHead className="font-medium text-quaternary">
                Reporte
              </TableHead>
              <TableHead className="font-medium hidden md:table-cell">
                <div className="flex items-center justify-center gap-1 text-quaternary">
                  Fecha
                  <Image
                    className="mt-1"
                    src="/home/button-utility.svg"
                    alt="icon"
                    width={20}
                    height={20}
                  />
                </div>
              </TableHead>

              <TableHead className="font-medium">
                <div className="flex items-center justify-center gap-1 text-quaternary">
                  Estado
                  <Image
                    className="mt-1"
                    src="/home/button-utility.svg"
                    alt="icon"
                    width={20}
                    height={20}
                  />
                </div>
              </TableHead>

              <TableHead className="font-medium hidden md:table-cell">
                <div className="flex items-center justify-center gap-1 text-quaternary">
                  Categoría
                  <Image
                    className="mt-1"
                    src="/home/button-utility.svg"
                    alt="icon"
                    width={20}
                    height={20}
                  />
                </div>
              </TableHead>

              <TableHead className="font-medium hidden md:table-cell">
                <div className="flex items-center justify-center gap-1 text-quaternary">
                  Reservado por
                  <Image
                    className="mt-1"
                    src="/home/button-utility.svg"
                    alt="icon"
                    width={20}
                    height={20}
                  />
                </div>
              </TableHead>

              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow
                key={report.id}
                className="border-b border-gray-200"
              >
                <TableCell className="max-w-75 whitespace-normal break-words leading-5 py-2">
                  <p className="text-sm">&ldquo;{report.content}&rdquo;</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreg round">
                    {report.date}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 hover:bg-orange-100"
                  >
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-normal break-words leading-5 max-w-36 hidden md:table-cell">
                  <span className="text-sm text-muted-foreground whitespace-normal break-words leading-5">
                    {report.category}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          report.reportedBy.avatar.startsWith("/")
                            ? report.reportedBy.avatar
                            : ""
                        }
                      />
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {report.reportedBy.avatar.startsWith("/")
                          ? report.reportedBy.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : report.reportedBy.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {report.reportedBy.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {report.reportedBy.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-error-primary font-semibold">
                        <Trash2 className="mr-2 h-4 w-4 text-error-primary" />
                        Eliminar reporte
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border border-b mt-3"></div>
        <div className="flex justify-center pt-4">
          <Button
            className="mx-auto ml-1 lg:ml-10 rounded-full text-secondary text-sm"
            variant="outline"
          >
            Ver todos los reportes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TableReport
