import { useMemo } from 'react';
import { useDrag } from '../../hooks/useDrag';
import { CustomField, FieldType } from '../../types/formbuilder';
import { MoreVertical } from 'lucide-react';
import { 
  AlignLeft, 
  Tag, 
  Calendar, 
  CheckSquare, 
  CircleDot, 
  ListOrdered, 
  Heading,
  Hash, 
  Type
} from 'lucide-react';

export default function CustomFieldSidebar() {
  // Define all available custom fields
  const customFields = useMemo<CustomField[]>(() => [
    { type: 'text', label: 'Text Field', icon: 'type' },
    { type: 'number', label: 'Number Input', icon: 'hash' },
    { type: 'dropdown', label: 'Combo Box / Dropdown', icon: 'chevron-down' },
    { type: 'number-combo', label: 'Number Combo Box', icon: 'list-ordered' },
    { type: 'radio', label: 'Radio Button', icon: 'circle-dot' },
    { type: 'checkbox', label: 'Checkbox', icon: 'check-square' },
    { type: 'date', label: 'Datepicker', icon: 'calendar' },
    { type: 'label', label: 'Label', icon: 'tag' },
    { type: 'textarea', label: 'Text Area', icon: 'align-left' },
  ], []);

  // Helper to render the appropriate icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'type':
        return <Type className="text-neutral-500" size={16} />;
      case 'hash':
        return <Hash className="text-neutral-500" size={16} />;
      case 'chevron-down':
        return <Heading className="text-neutral-500" size={16} />;
      case 'list-ordered':
        return <ListOrdered className="text-neutral-500" size={16} />;
      case 'circle-dot':
        return <CircleDot className="text-neutral-500" size={16} />;
      case 'check-square':
        return <CheckSquare className="text-neutral-500" size={16} />;
      case 'calendar':
        return <Calendar className="text-neutral-500" size={16} />;
      case 'tag':
        return <Tag className="text-neutral-500" size={16} />;
      case 'align-left':
        return <AlignLeft className="text-neutral-500" size={16} />;
      default:
        return <Type className="text-neutral-500" size={16} />;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-neutral-200 flex flex-col overflow-auto">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-sm font-semibold">Custom Field</h2>
      </div>
      
      <div className="p-3 overflow-y-auto">
        {customFields.map((field) => (
          <DraggableCustomField 
            key={field.type}
            field={field}
            renderIcon={renderIcon}
          />
        ))}
      </div>
    </div>
  );
}

interface DraggableCustomFieldProps {
  field: CustomField;
  renderIcon: (iconName: string) => React.ReactNode;
}

function DraggableCustomField({ field, renderIcon }: DraggableCustomFieldProps) {
  const { handleDragStart, handleDragEnd, isDragging } = useDrag({
    type: 'palette-item',
    fieldType: field.type as FieldType,
  });

  return (
    <div
      className={`bg-white rounded-lg mb-2 border border-neutral-200 p-3 flex items-center justify-between cursor-move hover:border-neutral-300 shadow-sm ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-field-type={field.type}
    >
      <div className="flex items-center">
        <span className="mr-2">{renderIcon(field.icon)}</span>
        <span>{field.label}</span>
      </div>
      <MoreVertical className="text-neutral-400 cursor-pointer" size={16} />
    </div>
  );
}
