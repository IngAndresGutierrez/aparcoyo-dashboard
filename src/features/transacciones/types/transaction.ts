// types/platformStats.ts

export interface GraphDataPoint {
  date: string;
  amount: number;
}

export interface Transaction {
  factura: string;
  importe: string;
  fecha: string;
  estado: string;
  cliente: string;
  tipo: string;
}

export interface PlatformStatistics {
  ingresosBrutos: number;
  pagosAPropietarios: number;
  comisionesGeneradas: number;
  ingresosNetos: number;
  percentageChange: number;
  previousIngresosBrutos: number;
  transactionsCount: number;
  graphData: {
    current: GraphDataPoint[];
    previous: GraphDataPoint[];
  };
  transactions: Transaction[];
}

export interface PlatformStatsResponse {
  ok: boolean;
  data: PlatformStatistics;
  msg: string;
}

// Types para componentes (transformados)
export interface ChartDataPoint {
  date: string;
  current: number;
  previous: number;
}

export interface CardStatistic {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon?: string;
}