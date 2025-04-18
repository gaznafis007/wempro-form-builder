export type FieldType = 
  | 'text'
  | 'number'
  | 'dropdown'
  | 'number-combo'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'label'
  | 'textarea';

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  defaultValue?: string | number | boolean | string[];
}

export interface Fieldset {
  id: string;
  name: string;
  fields: FormField[];
}

export interface FormState {
  fieldsets: Fieldset[];
  selectedFieldId: string | null;
  selectedFieldsetId: string | null;
  isDragging: boolean;
  lastSaved: Date | null;
  isDraft: boolean;
}

export interface CustomField {
  type: FieldType;
  label: string;
  icon: string;
}
