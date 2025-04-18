import { useState } from 'react';
import { useFormBuilder } from '../../context/FormBuilderContext';
import { useDrop } from '../../hooks/useDrag';
import { FieldType } from '../../types/formbuilder';
import Fieldset from './Fieldset';
import DroppableIndicator from './DroppableIndicator';

interface FormCanvasProps {
  onDrop: (data: Record<string, string>) => void;
}

export default function FormCanvas({ onDrop }: FormCanvasProps) {
  const { state, addFieldset, addField } = useFormBuilder();
  const [showDropIndicator, setShowDropIndicator] = useState(false);

  // Handle dropping a component from the palette
  const handleCanvasDrop = (data: Record<string, string>) => {
    const isFirstFieldset = state.fieldsets.length === 0;
    const isPaletteItem = data.type === 'palette-item' && data.fieldType;
    
    if (isPaletteItem) {
      console.log('FormCanvas received drop', {
        isFirstFieldset,
        type: data.type,
        fieldType: data.fieldType
      });
      
      if (isFirstFieldset) {
        // For the very first fieldset, handle it in the Canvas component
        const fieldsetId = addFieldset();
        addField(fieldsetId, data.fieldType as FieldType);
        
        // Done - don't pass to parent
        setShowDropIndicator(false);
        return;
      }
    }
    
    // For all other cases, let the parent component handle it
    setShowDropIndicator(false);
    onDrop(data);
  };

  // Set up drop handlers
  const { 
    isOver, 
    handleDragOver, 
    handleDragEnter, 
    handleDragLeave, 
    handleDrop 
  } = useDrop({
    type: 'canvas',
    onDrop: handleCanvasDrop,
  });

  // Handle drag enter to show the drop indicator
  const handleCanvasDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEnter(e);
    setShowDropIndicator(true);
  };

  // Handle drag leave to hide the drop indicator
  const handleCanvasDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragLeave(e);
    setShowDropIndicator(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#F7F7F9]">
      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-2">Your Module</h2>
      </div>

      {/* Form Canvas */}
      <div 
        className="relative bg-white rounded-lg min-h-[70vh] border border-neutral-200 p-4"
        onDragOver={handleDragOver}
        onDragEnter={handleCanvasDragEnter}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleDrop}
        data-testid="form-canvas"
      >
        {/* Empty State */}
        {state.fieldsets.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="mb-4 text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 mx-auto">
                <rect x="3" y="3" width="6" height="6" rx="1" />
                <rect x="15" y="3" width="6" height="6" rx="1" />
                <rect x="3" y="15" width="6" height="6" rx="1" />
                <rect x="15" y="15" width="6" height="6" rx="1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-700 mb-2">Welcome to the Form Builder!</h3>
            <p className="text-neutral-500 mb-4">Start by adding your first module to create amazing forms.</p>
            <p className="text-sm text-neutral-400 mb-6">
              Drag fields from the left panel and drop them here to create your first fieldset
            </p>
            
            {/* Drop indicator for empty state */}
            {showDropIndicator && isOver && (
              <div className="border-2 border-dashed border-primary/40 rounded-lg p-8 mt-4 bg-primary/5 w-full">
                <p className="text-primary font-medium">Drop field here to create your first fieldset</p>
              </div>
            )}
          </div>
        )}

        {/* Fieldsets */}
        {state.fieldsets.length > 0 && (
          <div>
            {state.fieldsets.map((fieldset) => (
              <Fieldset 
                key={fieldset.id} 
                fieldset={fieldset}
              />
            ))}
            
            {/* Drop Area Indicator for additional fieldsets */}
            {showDropIndicator && isOver && (
              <div className="mt-6 mb-4">
                <DroppableIndicator message="Drop field here to create a new fieldset" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
