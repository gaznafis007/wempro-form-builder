import { useRef } from 'react';
import { useDrag } from '../../hooks/useDrag';
import { useFormBuilder } from '../../context/FormBuilderContext';
import { FormField, FieldType } from '../../types/formbuilder';
import { GripVertical, Copy, Trash } from 'lucide-react';
import { Button } from '../ui/button';

interface DraggableFieldProps {
  field: FormField;
  fieldsetId: string;
  index: number;
}

export default function DraggableField({ field, fieldsetId, index }: DraggableFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const { selectField, duplicateField, removeField, state } = useFormBuilder();
  
  // Set up drag handlers
  const { handleDragStart, handleDragEnd, isDragging } = useDrag({
    type: 'field-item',
    fieldId: field.id,
    fieldsetId,
  });
  
  // Handle field selection
  const handleFieldClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectField(field.id);
  };
  
  // Duplicate the current field
  const handleDuplicateField = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateField(fieldsetId, field.id);
  };
  
  // Delete the current field
  const handleDeleteField = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeField(fieldsetId, field.id);
  };
  
  // Determine if this field is selected
  const isSelected = state.selectedFieldId === field.id;
  
  return (
    <div 
      ref={fieldRef}
      className={`field-item border ${isSelected ? 'border-[#4A6CF7] border-2' : 'border-neutral-100'} 
        rounded-md px-3 py-2 hover:border-neutral-300 cursor-move flex items-start group transition-colors`}
      onClick={handleFieldClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-field-type={field.type}
      data-field-id={field.id}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="drag-handle text-neutral-400 mr-2 cursor-move mt-1">
        <GripVertical size={16} />
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className="text-sm font-medium text-neutral-700">{field.label}</span>
          
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-neutral-500 hover:text-neutral-700"
              onClick={handleDuplicateField}
              title="Duplicate field"
            >
              <Copy size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-neutral-500 hover:text-red-500"
              onClick={handleDeleteField}
              title="Delete field"
            >
              <Trash size={14} />
            </Button>
          </div>
        </div>
        
        {/* Render field type preview */}
        <RenderFieldPreview field={field} />
      </div>
    </div>
  );
}

// Helper component to render a preview of the field based on its type
function RenderFieldPreview({ field }: { field: FormField }) {
  switch (field.type) {
    case 'text':
      return (
        <div className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm text-neutral-500">
          {field.placeholder || 'Enter text here'}
        </div>
      );
    
    case 'number':
      return (
        <div className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm text-neutral-500">
          0
        </div>
      );
    
    case 'textarea':
      return (
        <div className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm text-neutral-500 h-20">
          {field.placeholder || 'Enter text here'}
        </div>
      );
    
    case 'dropdown':
    case 'number-combo':
      return (
        <div className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm text-neutral-500 flex justify-between items-center">
          <span>Select an option</span>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50">
            <path d="M4.5 6.5L7.5 9.5L10.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    
    case 'checkbox':
      return (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <div key={option.id} className="flex items-center">
              <div className="h-4 w-4 border border-neutral-300 rounded bg-white"></div>
              <span className="ml-2 text-sm text-neutral-700">{option.label}</span>
            </div>
          ))}
        </div>
      );
    
    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <div key={option.id} className="flex items-center">
              <div className="h-4 w-4 border border-neutral-300 rounded-full bg-white"></div>
              <span className="ml-2 text-sm text-neutral-700">{option.label}</span>
            </div>
          ))}
        </div>
      );
    
    case 'date':
      return (
        <div className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm text-neutral-500 flex justify-between items-center">
          <span>Select date</span>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50">
            <path d="M3.5 2.5V4.5M11.5 2.5V4.5M2.5 7H12.5M2.5 5.5C2.5 4.94772 2.94772 4.5 3.5 4.5H11.5C12.0523 4.5 12.5 4.94772 12.5 5.5V11.5C12.5 12.0523 12.0523 12.5 11.5 12.5H3.5C2.94772 12.5 2.5 12.0523 2.5 11.5V5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    
    case 'label':
      return (
        <p className="text-sm font-medium text-neutral-800">
          {field.label || 'Label Text'}
        </p>
      );
    
    default:
      return null;
  }
}
