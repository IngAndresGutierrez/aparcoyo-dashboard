// hooks/usePlatformStats.ts
import { useState, useEffect, useCallback } from 'react';
import { PlatformStatsResponse } from '../types/transaction';
import { platformStatsService } from '../services/transaction-service';


interface UsePlatformStatsState {
  data: PlatformStatsResponse | null;
  loading: boolean;
  error: string | null;
}

interface UsePlatformStatsOptions {
  refetchInterval?: number; // en milisegundos
  autoFetch?: boolean;
}

export const usePlatformStats = (options: UsePlatformStatsOptions = {}) => {
  const { refetchInterval, autoFetch = true } = options;
  
  const [state, setState] = useState<UsePlatformStatsState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    console.log('🔄 Iniciando fetchStats...');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔄 Llamando a platformStatsService...');
      const data = await platformStatsService.getPlatformStatistics();
      console.log('✅ Datos recibidos en hook:', data);
      
      // Validación adicional de la estructura de datos
      if (!data) {
        throw new Error('No se recibieron datos del servidor');
      }
      
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Error en fetchStats:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
      
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = JSON.stringify(error);
      }
      
      console.error('❌ Error message final:', errorMessage);
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, []);

  const fetchStatsByPeriod = useCallback(async (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await platformStatsService.getPlatformStatisticsByPeriod(period);
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, []);

  const fetchStatsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await platformStatsService.getPlatformStatisticsByDateRange(startDate, endDate);
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, []);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-fetch al montar el componente
  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [fetchStats, autoFetch]);

  // Refetch automático con intervalo
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchStats, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refetchInterval]);

  return {
    // Estados
    data: state.data,
    loading: state.loading,
    error: state.error,
    
    // Acciones
    refetch,
    fetchStats,
    fetchStatsByPeriod,
    fetchStatsByDateRange,
    
    // Datos procesados para facilitar el uso
    statistics: state.data?.data || null,
    chartData: state.data?.data.graphData ? 
      state.data.data.graphData.current.map(item => ({
        date: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        current: item.amount,
        previous: 0 // Por ahora, hasta que tengas datos previous
      })) : [],
    transactions: state.data?.data.transactions || [],
    
    // Estados derivados
    hasData: state.data !== null,
    isSuccess: state.data !== null && !state.loading && !state.error,
  };
};