"use client"


import { Loader2, RefreshCw } from "lucide-react"
import { useEffect } from "react"
import { useReportes } from "../../hooks/useReportsTable";

interface MetricCardReportsProps {
  filtroFecha?: string
}

const MetricCardReports: React.FC<MetricCardReportsProps> = ({ 
  filtroFecha = "mes" 
}) => {
  // Solo UNA declaración del hook
  const { data, loading, error, refresh, getSummary } = useReportes();

  // Cargar datos cuando cambie el filtro
  useEffect(() => {
    getSummary(filtroFecha);
  }, [filtroFecha, getSummary]);

  // Si está cargando
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  // Si hay error
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-full p-4 border rounded-lg bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-red-600 text-sm">Error: {error}</span>
            <button 
              onClick={() => refresh(filtroFecha)}
              className="text-red-600 hover:text-red-800"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Crear las 3 cards exactas que necesitas
  const cardsItems = [
    {
      title: "Total reportes recibidos",
      value: data?.metrics.totalReportes || 0,
      icon: "",
      color: "text-blue-600"
    },
    {
      title: "Reportes pendientes",
      value: data?.metrics.pendientes || 0,
      icon: "",
      color: "text-yellow-600"
    },
    {
      title: "Reportes resueltos",
      value: data?.metrics.resueltos || 0,
      icon: "",
      color: "text-green-600"
    },
  ];

  const renderCards = cardsItems.map((item, index) => {
    return (
      <div
        key={index}
        className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2"
      >
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            {item.title}
          </h2>
          <p className={`text-xl font-bold mt-2 ${item.color}`}>
            {item.value.toLocaleString()}
          </p>
        </div>
      </div>
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {renderCards}
    </div>
  );
};

export default MetricCardReports;