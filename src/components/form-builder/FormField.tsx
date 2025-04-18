import { useFormBuilder } from '../../context/FormBuilderContext';
import { useDrag } from '../../hooks/useDrag';
import { FormField as FormFieldType } from '../../types/formbuilder';
import { GripVertical } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FormFieldProps {
  field: FormFieldType;
  fieldsetId: string;
}

export default function FormField({ field, fieldsetId }: FormFieldProps) {
  const { selectField, state } = useFormBuilder();
  
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
  
  // Determine if this field is selected
  const isSelected = state.selectedFieldId === field.id;
  
  // Render the appropriate input based on field type
  const renderFieldInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            placeholder={field.placeholder || 'Enter text here'}
            className="w-full"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder="0"
            className="w-full"
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder || 'Enter text here'}
            className="w-full"
          />
        );
      
      case 'dropdown':
      case 'number-combo':
        return (
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-50 w-full" style={{ position: 'absolute', zIndex: 50 }}>
              {field.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.id} className="flex items-center">
                <Checkbox id={`${field.id}-${option.id}`} className="h-4 w-4" />
                <Label htmlFor={`${field.id}-${option.id}`} className="ml-2 text-sm text-neutral-700">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <RadioGroup>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.id} className="flex items-center">
                  <RadioGroupItem id={`${field.id}-${option.id}`} value={option.value} className="h-4 w-4" />
                  <Label htmlFor={`${field.id}-${option.id}`} className="ml-2 text-sm text-neutral-700">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            className="w-full"
          />
        );
      
      case 'label':
        return (
          <p className="text-sm text-neutral-700">
            {field.label || 'Label Text'}
          </p>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`field-item border ${isSelected ? 'border-[#4A6CF7] border-2' : 'border-neutral-100'} rounded px-3 py-2 hover:border-neutral-300 cursor-move flex items-center`}
      onClick={handleFieldClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-field-type={field.type}
      data-field-id={field.id}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="drag-handle text-neutral-400 mr-2 cursor-move">
        <GripVertical size={16} />
      </div>
      
      <div className="flex-1">
        {field.type !== 'label' && (
          <label className="block text-sm font-medium mb-1">{field.label}</label>
        )}
        
        {renderFieldInput()}
      </div>
    </div>
  );
}
