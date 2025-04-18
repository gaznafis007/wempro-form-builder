import { useState } from 'react';
import { useFormBuilder } from '../../context/FormBuilderContext';
import { useDrop } from '../../hooks/useDrag';
import { Fieldset as FieldsetType, FieldType } from '../../types/formbuilder';
import { GripHorizontal, Trash2 } from 'lucide-react';
import FormField from './FormField';
import DroppableIndicator from './DroppableIndicator';

interface FieldsetProps {
  fieldset: FieldsetType;
}

export default function Fieldset({ fieldset }: FieldsetProps) {
  const { addField, moveField, selectFieldset, removeFieldset } = useFormBuilder();
  const [showDropIndicator, setShowDropIndicator] = useState(false);

  // Handle dropping a field into this fieldset
  const handleFieldsetDrop = (data: Record<string, string>) => {
    if (data.type === 'palette-item' && data.fieldType) {
      // Add a new field from the palette
      addField(fieldset.id, data.fieldType as FieldType);
    } else if (data.type === 'field-item' && data.fieldId && data.sourceFieldsetId) {
      // Move an existing field from another fieldset
      moveField(data.sourceFieldsetId, fieldset.id, data.fieldId);
    }
    
    // Reset drop indicator
    setShowDropIndicator(false);
  };

  // Set up drop handlers
  const { 
    isOver, 
    handleDragOver, 
    handleDragEnter, 
    handleDragLeave, 
    handleDrop 
  } = useDrop({
    type: 'fieldset',
    fieldsetId: fieldset.id,
    onDrop: handleFieldsetDrop,
  });

  // Handle click to select this fieldset
  const handleFieldsetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectFieldset(fieldset.id);
  };

  // Handle drag enter to show drop indicator
  const handleFieldsetDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEnter(e);
    setShowDropIndicator(true);
  };

  // Handle drag leave to hide drop indicator
  const handleFieldsetDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragLeave(e);
    setShowDropIndicator(false);
  };

  return (
    <div 
      className="fieldset mb-6 border border-neutral-200 rounded-lg overflow-hidden"
      onClick={handleFieldsetClick}
      data-fieldset-id={fieldset.id}
    >
      <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="font-medium text-sm">{fieldset.name}</h3>
        <div className="flex items-center text-neutral-400 text-sm space-x-1">
          <button 
            className="p-1 hover:text-red-500 transition-colors"
            title="Delete fieldset"
            onClick={(e) => {
              e.stopPropagation();
              removeFieldset(fieldset.id);
            }}
          >
            <Trash2 size={16} />
          </button>
          <button className="p-1 hover:text-neutral-700" title="Drag fieldset">
            <GripHorizontal size={16} />
          </button>
        </div>
      </div>
      
      <div 
        className="p-4 space-y-3 fieldset-content"
        onDragOver={handleDragOver}
        onDragEnter={handleFieldsetDragEnter}
        onDragLeave={handleFieldsetDragLeave}
        onDrop={handleDrop}
      >
        {/* Render all fields in this fieldset */}
        {fieldset.fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            fieldsetId={fieldset.id}
          />
        ))}
        
        {/* Show drop indicator when dragging over empty fieldset */}
        {fieldset.fields.length === 0 && (
          <div className="text-center py-4 text-neutral-400 text-sm">
            Drag and drop fields here
          </div>
        )}
        
        {/* Show drop indicator when dragging over non-empty fieldset */}
        {fieldset.fields.length > 0 && showDropIndicator && isOver && (
          <DroppableIndicator message="Drop field here" />
        )}
      </div>
    </div>
  );
}
