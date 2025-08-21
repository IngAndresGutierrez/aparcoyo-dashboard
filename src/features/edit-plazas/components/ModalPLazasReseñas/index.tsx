import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import {  Edit3 } from 'lucide-react';

const EditReviewModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [reviewText, setReviewText] = useState("Muy buena experiencia. El acceso fue fácil y el lugar se sentía seguro. Repetiré sin duda cuando vuelva por la zona.");

  const handleSave = () => {
    // Aquí iría la lógica para guardar la reseña
    console.log('Guardando reseña:', reviewText);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline" 
        className="mb-4"
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Abrir Modal Editar Reseña
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-white rounded-xl shadow-xl">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Editar reseña
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="review" 
                  className="text-sm font-medium text-gray-700"
                >
                  Reseña
                </Label>
                <textarea
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Escribe tu reseña aquí..."
                  className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditReviewModal;