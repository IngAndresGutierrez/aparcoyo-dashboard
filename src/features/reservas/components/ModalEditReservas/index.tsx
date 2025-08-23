/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Edit3, User } from 'lucide-react';
import { ReservaTable } from '../../types';

interface EditReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationData: ReservaTable | null;
  onUpdate?: (updatedReservation: any) => void;
}

const EditReservationModal: React.FC<EditReservationModalProps> = ({
  isOpen,
  onClose,
  reservationData,
  onUpdate
}) => {
  const [reservedSpace, setReservedSpace] = useState('');
  const [reservedBy, setReservedBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateReservation = async () => {
    if (!reservationData?.id) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/apa/reservas/${reservationData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Agregar si necesitas auth
        },
        body: JSON.stringify({
          plazaReservada: reservedSpace,
          reservadoPor: reservedBy
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedReservation = await response.json();
      console.log('Reserva actualizada:', updatedReservation);
      
      onUpdate?.(updatedReservation);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error actualizando reserva:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && reservationData) {
      // Extraer nombres de los objetos
      const plazaNombre = (reservationData.plaza as any)?.nombre || 
                         (reservationData.plaza as any)?.direccion || 
                         'Sin plaza';
      const userEmail = (reservationData.usuario as any)?.email || 
                        (reservationData.usuario as any)?.correo || 
                        'Sin email';
      
      setReservedSpace(plazaNombre);
      setReservedBy(userEmail);
      setError(null);
    }
  }, [isOpen, reservationData]);

  if (!reservationData) return null;

  const usuario = reservationData.usuario as any;
  const userName = usuario?.nombre || 'Sin nombre';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full max-w-sm mx-auto bg-white rounded-lg shadow-xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-blue-600" />
            </div>
            <DialogTitle className="text-gray-900 font-medium text-base">
              Editar Detalles de Reserva
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm font-medium text-gray-900 mb-4">
            Detalles de la reserva
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Plaza reservada */}
          <div className="space-y-2">
            <Label htmlFor="plaza" className="text-sm text-gray-600">
              Plaza reservada
            </Label>
            <Select value={reservedSpace} onValueChange={setReservedSpace}>
              <SelectTrigger className="w-full h-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span className="text-sm text-gray-700">{reservedSpace}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={reservedSpace}>
                  {reservedSpace}
                </SelectItem>
                <SelectItem value="O Park Mayfair Car Park">
                  O Park Mayfair Car Park
                </SelectItem>
                <SelectItem value="Plaza Central A1">
                  Plaza Central A1
                </SelectItem>
                <SelectItem value="Parking Norte B2">
                  Parking Norte B2
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reservado por */}
          <div className="space-y-2">
            <Label htmlFor="reservado-por" className="text-sm text-gray-600">
              Reservado por
            </Label>
            <Select value={reservedBy} onValueChange={setReservedBy}>
              <SelectTrigger className="w-full h-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{userName}</span>
                  <span className="text-sm text-gray-500 ml-1">{reservedBy}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={reservedBy}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span>{userName}</span>
                    <span className="text-gray-500 ml-1">{reservedBy}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={updateReservation}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditReservationModal;