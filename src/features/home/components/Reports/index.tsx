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
import { MoreHorizontal, Trash2, UserMinus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const reports = [
  {
    id: 1,
    content: "Me habló con groserías y me insultó cuando le pedí que se moviera un poco.",
    date: "Jan 16, 2025",
    status: "Pendiente",
    category: "Contenido falso o engañoso",
    reportedBy: {
      name: "Sienna Hewitt",
      email: "hi@siennahewitt...",
      avatar: "SH"
    }
  },
  {
    id: 2,
    content: "El usuario no era el mismo que aparecía en la reserva, parecía alguien diferente.",
    date: "Jan 16, 2025",
    status: "Pendiente",
    category: "Ubicación incorrecta o inexistente",
    reportedBy: {
      name: "Piper Williamson",
      email: "pippa@pippawc...",
      avatar: "PW"
    }
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
      avatar: "OS"
    }
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
      avatar: "ML"
    }
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
      avatar: "JV"
    }
  },
  {
    id: 6,
    content: "Me insistió varias veces para cancelar la reserva y no pagarle en efectivo.",
    date: "Jan 14, 2025",
    status: "Pendiente",
    category: "Spam o mensajes irrelevantes",
    reportedBy: {
      name: "Zaid Schwartz",
      email: "zaid@zaidstudio...",
      avatar: "ZS"
    }
  }
]

const TableReport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">18 Reportes recibidos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Reporte</TableHead>
              <TableHead className="font-medium">Fecha</TableHead>
              <TableHead className="font-medium">Estado</TableHead>
              <TableHead className="font-medium">Categoría</TableHead>
              <TableHead className="font-medium">Reservado por</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="max-w-[300px]">
                  <p className="text-sm">&ldquo;{report.content}&rdquo;</p>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{report.date}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{report.category}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {report.reportedBy.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{report.reportedBy.name}</span>
                      <span className="text-xs text-muted-foreground">{report.reportedBy.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar reporte
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-blue-600">
                        <UserMinus className="mr-2 h-4 w-4" />
                        Suspender usuario
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-center pt-4">
          <Button variant="outline">
            Ver todos los reportes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TableReport