import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { FormState, FormField, Fieldset, FieldType, FieldOption } from '../types/formbuilder';
import { generateUniqueId, generateUniqueName } from '../lib/utils/fieldUtils';
import { useToast } from '../hooks/use-toast';

// Define the context type
interface FormBuilderContextProps {
  state: FormState;
  addFieldset: (name?: string) => string;
  addField: (fieldsetId: string, type: FieldType, position?: number) => void;
  removeField: (fieldsetId: string, fieldId: string) => void;
  removeFieldset: (fieldsetId: string) => void;
  duplicateField: (fieldsetId: string, fieldId: string) => void;
  updateField: (fieldsetId: string, fieldId: string, updates: Partial<FormField>) => void;
  updateFieldset: (fieldsetId: string, updates: Partial<Fieldset>) => void;
  selectField: (fieldId: string | null) => void;
  selectFieldset: (fieldsetId: string | null) => void;
  moveField: (sourceFieldsetId: string, targetFieldsetId: string, fieldId: string, position?: number) => void;
  moveFieldset: (fieldsetId: string, position: number) => void;
  addOption: (fieldsetId: string, fieldId: string) => void;
  updateOption: (fieldsetId: string, fieldId: string, optionId: string, label: string) => void;
  removeOption: (fieldsetId: string, fieldId: string, optionId: string) => void;
  setIsDragging: (isDragging: boolean) => void;
  saveForm: (asDraft?: boolean) => Promise<void>;
  getSelectedField: () => { field: FormField | null, fieldset: Fieldset | null };
}

// Initial state
const initialState: FormState = {
  fieldsets: [],
  selectedFieldId: null,
  selectedFieldsetId: null,
  isDragging: false,
  lastSaved: null,
  isDraft: false,
};

// Create context
const FormBuilderContext = createContext<FormBuilderContextProps | undefined>(undefined);

// Action types
type Action =
  | { type: 'ADD_FIELDSET'; payload: { fieldset: Fieldset } }
  | { type: 'ADD_FIELD'; payload: { fieldsetId: string; field: FormField; position?: number } }
  | { type: 'REMOVE_FIELD'; payload: { fieldsetId: string; fieldId: string } }
  | { type: 'REMOVE_FIELDSET'; payload: { fieldsetId: string } }
  | { type: 'UPDATE_FIELD'; payload: { fieldsetId: string; fieldId: string; updates: Partial<FormField> } }
  | { type: 'UPDATE_FIELDSET'; payload: { fieldsetId: string; updates: Partial<Fieldset> } }
  | { type: 'SELECT_FIELD'; payload: { fieldId: string | null } }
  | { type: 'SELECT_FIELDSET'; payload: { fieldsetId: string | null } }
  | { type: 'DUPLICATE_FIELD'; payload: { fieldsetId: string; field: FormField } }
  | { type: 'MOVE_FIELD'; payload: { sourceFieldsetId: string; targetFieldsetId: string; fieldId: string; position?: number } }
  | { type: 'MOVE_FIELDSET'; payload: { fieldsetId: string; position: number } }
  | { type: 'ADD_OPTION'; payload: { fieldsetId: string; fieldId: string; option: FieldOption } }
  | { type: 'UPDATE_OPTION'; payload: { fieldsetId: string; fieldId: string; optionId: string; label: string } }
  | { type: 'REMOVE_OPTION'; payload: { fieldsetId: string; fieldId: string; optionId: string } }
  | { type: 'SET_IS_DRAGGING'; payload: { isDragging: boolean } }
  | { type: 'SET_FORM_STATE'; payload: { lastSaved: Date; isDraft: boolean } }
  | { type: 'SET_FULL_STATE'; payload: FormState };

// Reducer function
const formBuilderReducer = (state: FormState, action: Action): FormState => {
  switch (action.type) {
    case 'ADD_FIELDSET':
      return {
        ...state,
        fieldsets: [...state.fieldsets, action.payload.fieldset],
      };
    
    case 'ADD_FIELD': {
      const { fieldsetId, field, position } = action.payload;
      const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
      
      if (fieldsetIndex === -1) return state;
      
      const fieldset = state.fieldsets[fieldsetIndex];
      const newFields = [...fieldset.fields];
      
      if (position !== undefined && position >= 0 && position <= newFields.length) {
        newFields.splice(position, 0, field);
      } else {
        newFields.push(field);
      }
      
      const updatedFieldsets = [...state.fieldsets];
      updatedFieldsets[fieldsetIndex] = {
        ...fieldset,
        fields: newFields,
      };
      
      return {
        ...state,
        fieldsets: updatedFieldsets,
        selectedFieldId: field.id,
        selectedFieldsetId: fieldsetId,
      };
    }
    
    case 'REMOVE_FIELD': {
      const { fieldsetId, fieldId } = action.payload;
      const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
      
      if (fieldsetIndex === -1) return state;
      
      const fieldset = state.fieldsets[fieldsetIndex];
      const filteredFields = fieldset.fields.filter(f => f.id !== fieldId);
      
      const updatedFieldsets = [...state.fieldsets];
      updatedFieldsets[fieldsetIndex] = {
        ...fieldset,
        fields: filteredFields,
      };
      
      return {
        ...state,
        fieldsets: updatedFieldsets,
        selectedFieldId: state.selectedFieldId === fieldId ? null : state.selectedFieldId,
      };
    }
    
    case 'REMOVE_FIELDSET': {
      const { fieldsetId } = action.payload;
      const filteredFieldsets = state.fieldsets.filter(fs => fs.id !== fieldsetId);
      
      return {
        ...state,
        fieldsets: filteredFieldsets,
        selectedFieldsetId: state.selectedFieldsetId === fieldsetId ? null : state.selectedFieldsetId,
        selectedFieldId: state.selectedFieldsetId === fieldsetId ? null : state.selectedFieldId,
      };
    }
    
    case 'UPDATE_FIELD': {
      const { fieldsetId, fieldId, updates } = action.payload;
      const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
      
      if (fieldsetIndex === -1) return state;
      
      const fieldset = state.fieldsets[fieldsetIndex];
      const fieldIndex = fieldset.fields.findIndex(f => f.id === fieldId);
      
      if (fieldIndex === -1) return state;
      
      const updatedFields = [...fieldset.fields];
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        ...updates,
      };
      
      const updatedFieldsets = [...state.fieldsets];
      updatedFieldsets[fieldsetIndex] = {
        ...fieldset,
        fields: updatedFields,
      };
      
      return {
        ...state,
        fieldsets: updatedFieldsets,
      };
    }
    
    case 'UPDATE_FIELDSET': {
      const { fieldsetId, updates } = action.payload;
      const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
      
      if (fieldsetIndex === -1) return state;
      
      const updatedFieldsets = [...state.fieldsets];
      updatedFieldsets[fieldsetIndex] = {
        ...updatedFieldsets[fieldsetIndex],
        ...updates,
      };
      
      return {
        ...state,
        fieldsets: updatedFieldsets,
      };
    }
    
    case 'SELECT_FIELD':
      return {
        ...state,
        selectedFieldId: action.payload.fieldId,
      };
    
    case 'SELECT_FIELDSET':
      return {
        ...state,
        selectedFieldsetId: action.payload.fieldsetId,
      };
    
    case 'DUPLICATE_FIELD': {
      const { fieldsetId, field } = action.payload;
      const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
      
      if (fieldsetIndex === -1) return state;
      
      const fieldset = state.fieldsets[fieldsetIndex];
      const updatedFields = [...fieldset.fields, field];
      
      const updatedFieldsets = [...state.fieldsets];
      updatedFieldsets[fieldsetIndex] = {
        ...fieldset,
        fields: updatedFields,
      };
      
      return {
        ...state,
        fieldsets: updatedFieldsets,
        selectedFieldId: field.id,
      };
    }
    
    case 'MOVE_FIELD': {
      const { sourceFieldsetId, targetFieldsetId, fieldId, position } = action.payload;
      
      // If source and target fieldsets are the same and no position is specified, do nothing
      if (sourceFieldsetId === targetFieldsetId && position === undefined) {
        return state;
      }
      
      const sourceFieldsetIndex = state.fieldsets.findIndex(fs => fs.id === sourceFieldsetId);
      const targetFieldsetIndex = state.fieldsets.findIndex(fs => fs.id === targetFieldsetId);
      
      if (sourceFieldsetIndex === -1 || targetFieldsetIndex === -1) return state;
      
      const sourceFieldset = state.fieldsets[sourceFieldsetIndex];
      const fieldIndex = sourceFieldset.fields.findIndex(f => f.id === fieldId);
      
      if (fieldIndex === -1) return state;
      
      const field = sourceFieldset.fields[fieldIndex];
      
      // Create a new state to work with
      const updatedFieldsets = [...state.fieldsets];
      
      // Remove the field from the source fieldset
      const updatedSourceFields = sourceFieldset.fields.filter(f => f.id !== fieldId);
      updatedFieldsets[sourceFieldsetIndex] = {
        ...sourceFieldset,
        fields: updatedSourceFields,
      };
      
      // Add the field to the target fieldset
      const targetFieldset = state.fieldsets[targetFieldsetIndex];
      const updatedTargetFields = [...targetFieldset.fields];
      
      if (position !== undefined && position >= 0 && position <= updatedTargetFields.length) {
        updatedTargetFields.splice(position, 0, field);
      } else {
        updatedTargetFields.push(field);
      }
      
      updatedFieldsets[targetFieldsetIndex] = {
        ...targetFieldset,
        fields: updatedTargetFields,
      };
      
      return {
        ...state,
        fieldsets: updatedFieldsets,
      };
    }
    
    case 'ADD_OPTION': {
      const { fieldsetId, fieldId, option } = action.payload;
      const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
      
      if (fieldsetIndex === -1) return state;
      
      const fieldset = state.fieldsets[fieldsetIndex];
      const fieldIndex = fieldset.fields.findIndex(f => f.id === fieldId);
      
      if (fieldIndex === -1) return state;
      
      const field = fieldset.fields[fieldIndex];
      const options = field.options ? [...field.options, option] : [option];
      
      const updatedField = {
        ...field,
        options,
      };
      
      const updatedFields = [...fieldset.fields];
      updatedFields[fieldIndex] = updatedField;
      
      const updatedFieldsets = [...state.fieldsets];
      updatedFieldsets[fieldsetIndex] = {
        ...fieldset,
        fields: updatedFields,
      };
      
      return {
        ...state,
        fieldsets: updatedFieldsets,
      };
    }
    
    case 'UPDATE_OPTION': {
      const { fieldsetId, fieldId, optionId, label } = action.payload;
      const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
      
      if (fieldsetIndex === -1) return state;
      
      const fieldset = state.fieldsets[fieldsetIndex];
      const fieldIndex = fieldset.fields.findIndex(f => f.id === fieldId);
      
      if (fieldIndex === -1) return state;
      
      const field = fieldset.fields[fieldIndex];
      
      if (!field.options) return state;
      
      const optionIndex = field.options.findIndex(opt => opt.id === optionId);
      
      if (optionIndex === -1) return state;
      
      const updatedOptions = [...field.options];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        label,
        value: label.toLowerCase().replace(/\s+/g, '-'),
      };
      
      const updatedField = {
        ...field,
        options: updatedOptions,
      };
      
      const updatedFields = [...fieldset.fields];
      updatedFields[fieldIndex] = updatedField;
      
      const updatedFieldsets = [...state.fieldsets];
      updatedFieldsets[fieldsetIndex] = {
        ...fieldset,
        fields: updatedFields,
      };
      
      return {
        ...state,
        fieldsets: updatedFieldsets,
      };
    }
    
    case 'REMOVE_OPTION': {
      const { fieldsetId, fieldId, optionId } = action.payload;
      const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
      
      if (fieldsetIndex === -1) return state;
      
      const fieldset = state.fieldsets[fieldsetIndex];
      const fieldIndex = fieldset.fields.findIndex(f => f.id === fieldId);
      
      if (fieldIndex === -1) return state;
      
      const field = fieldset.fields[fieldIndex];
      
      if (!field.options) return state;
      
      const updatedOptions = field.options.filter(opt => opt.id !== optionId);
      
      const updatedField = {
        ...field,
        options: updatedOptions,
      };
      
      const updatedFields = [...fieldset.fields];
      updatedFields[fieldIndex] = updatedField;
      
      const updatedFieldsets = [...state.fieldsets];
      updatedFieldsets[fieldsetIndex] = {
        ...fieldset,
        fields: updatedFields,
      };
      
      return {
        ...state,
        fieldsets: updatedFieldsets,
      };
    }
    
    case 'MOVE_FIELDSET': {
      const { fieldsetId, position } = action.payload;
      const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
      
      if (fieldsetIndex === -1 || position < 0 || position >= state.fieldsets.length) {
        return state;
      }
      
      // If the position is the same as the current index, do nothing
      if (position === fieldsetIndex) {
        return state;
      }
      
      // Get the fieldset to move
      const fieldset = state.fieldsets[fieldsetIndex];
      
      // Create a new array without the fieldset
      const newFieldsets = state.fieldsets.filter(fs => fs.id !== fieldsetId);
      
      // Insert the fieldset at the new position
      newFieldsets.splice(position, 0, fieldset);
      
      return {
        ...state,
        fieldsets: newFieldsets,
      };
    }
    
    case 'SET_IS_DRAGGING':
      return {
        ...state,
        isDragging: action.payload.isDragging,
      };
    
    case 'SET_FORM_STATE':
      return {
        ...state,
        lastSaved: action.payload.lastSaved,
        isDraft: action.payload.isDraft,
      };
    
    case 'SET_FULL_STATE':
      return action.payload;
    
    default:
      return state;
  }
};

// Provider component
export const FormBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Load saved form on initial mount
  useEffect(() => {
    const loadSavedForm = async () => {
      try {
        // Try to use HTTPS if possible
        let apiUrl = 'https://team.dev.helpabode.com:54292/api/wempro/react-dev/coding-test/gazinafisrafi.gnr@gmail.com';
        
        // Set a timeout to prevent the fetch from hanging indefinitely
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch(apiUrl, { 
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.form) {
              dispatch({
                type: 'SET_FULL_STATE',
                payload: {
                  ...data.form,
                  lastSaved: data.form.lastSaved ? new Date(data.form.lastSaved) : null,
                },
              });
              
              // Show a success message
              toast({
                title: 'Form loaded',
                description: 'Your saved form has been loaded successfully.',
              });
            }
          } else {
            // Show specific error for HTTP issues
            toast({
              title: 'Error loading form',
              description: `Server returned an error: ${response.status} ${response.statusText}`,
              variant: 'destructive',
            });
          }
        } catch (error) {
          clearTimeout(timeoutId);
          
          // Handle network issues, abort errors, etc.
          const fetchError = error as Error;
          if (fetchError.name === 'AbortError') {
            toast({
              title: 'Connection timeout',
              description: 'The connection to the form API timed out. Working in offline mode.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Network error',
              description: 'Could not connect to the form API. Working in offline mode.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load saved form:', error);
        
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while loading the form.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedForm();
  }, [toast]);

  // Add a new fieldset
  const addFieldset = (name?: string): string => {
    const fieldsetId = generateUniqueId();
    const fieldsetName = name || generateUniqueName('Fieldset', state.fieldsets.map(fs => fs.name));
    
    dispatch({
      type: 'ADD_FIELDSET',
      payload: {
        fieldset: {
          id: fieldsetId,
          name: fieldsetName,
          fields: [],
        },
      },
    });
    
    return fieldsetId;
  };

  // Add a new field to a fieldset
  const addField = (fieldsetId: string, type: FieldType, position?: number) => {
    const fieldId = generateUniqueId();
    
    // Find existing field names in this fieldset for uniqueness
    const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
    const existingNames = fieldsetIndex !== -1 
      ? state.fieldsets[fieldsetIndex].fields.map(f => f.name) 
      : [];
    
    // Generate field data based on type
    const fieldData: FormField = {
      id: fieldId,
      type,
      name: generateUniqueName(type, existingNames),
      label: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
      placeholder: type === 'text' || type === 'textarea' ? 'Enter text here' : '',
      required: false,
    };
    
    // Add options for multi-choice field types
    if (type === 'dropdown' || type === 'radio' || type === 'checkbox' || type === 'number-combo') {
      fieldData.options = [
        { id: generateUniqueId(), label: 'Option 1', value: 'option-1' },
        { id: generateUniqueId(), label: 'Option 2', value: 'option-2' },
      ];
    }
    
    dispatch({
      type: 'ADD_FIELD',
      payload: {
        fieldsetId,
        field: fieldData,
        position,
      },
    });
  };

  // Remove a field from a fieldset
  const removeField = (fieldsetId: string, fieldId: string) => {
    dispatch({
      type: 'REMOVE_FIELD',
      payload: {
        fieldsetId,
        fieldId,
      },
    });
  };

  // Remove a fieldset
  const removeFieldset = (fieldsetId: string) => {
    dispatch({
      type: 'REMOVE_FIELDSET',
      payload: {
        fieldsetId,
      },
    });
  };

  // Duplicate a field
  const duplicateField = (fieldsetId: string, fieldId: string) => {
    const fieldsetIndex = state.fieldsets.findIndex(fs => fs.id === fieldsetId);
    
    if (fieldsetIndex === -1) return;
    
    const fieldset = state.fieldsets[fieldsetIndex];
    const fieldToDuplicate = fieldset.fields.find(f => f.id === fieldId);
    
    if (!fieldToDuplicate) return;
    
    // Generate a unique name for the duplicate
    const existingNames = fieldset.fields.map(f => f.name);
    const newName = generateUniqueName(`${fieldToDuplicate.name} copy`, existingNames);
    
    // Create a deep copy of options if they exist
    const newOptions = fieldToDuplicate.options 
      ? fieldToDuplicate.options.map(opt => ({ 
          id: generateUniqueId(), 
          label: opt.label, 
          value: opt.value
        })) 
      : undefined;
    
    const duplicatedField: FormField = {
      ...fieldToDuplicate,
      id: generateUniqueId(),
      name: newName,
      options: newOptions,
    };
    
    dispatch({
      type: 'DUPLICATE_FIELD',
      payload: {
        fieldsetId,
        field: duplicatedField,
      },
    });
  };

  // Update field properties
  const updateField = (fieldsetId: string, fieldId: string, updates: Partial<FormField>) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        fieldsetId,
        fieldId,
        updates,
      },
    });
  };

  // Update fieldset properties
  const updateFieldset = (fieldsetId: string, updates: Partial<Fieldset>) => {
    dispatch({
      type: 'UPDATE_FIELDSET',
      payload: {
        fieldsetId,
        updates,
      },
    });
  };

  // Select a field
  const selectField = (fieldId: string | null) => {
    dispatch({
      type: 'SELECT_FIELD',
      payload: {
        fieldId,
      },
    });
  };

  // Select a fieldset
  const selectFieldset = (fieldsetId: string | null) => {
    dispatch({
      type: 'SELECT_FIELDSET',
      payload: {
        fieldsetId,
      },
    });
  };

  // Move a field between fieldsets or within a fieldset
  const moveField = (sourceFieldsetId: string, targetFieldsetId: string, fieldId: string, position?: number) => {
    dispatch({
      type: 'MOVE_FIELD',
      payload: {
        sourceFieldsetId,
        targetFieldsetId,
        fieldId,
        position,
      },
    });
  };
  
  // Move a fieldset to a new position in the canvas
  const moveFieldset = (fieldsetId: string, position: number) => {
    dispatch({
      type: 'MOVE_FIELDSET',
      payload: {
        fieldsetId,
        position,
      },
    });
  };

  // Add an option to a multi-choice field
  const addOption = (fieldsetId: string, fieldId: string) => {
    // Find existing options to determine the next number
    const fieldset = state.fieldsets.find(fs => fs.id === fieldsetId);
    if (!fieldset) return;
    
    const field = fieldset.fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    
    const optionNumber = field.options.length + 1;
    const option: FieldOption = {
      id: generateUniqueId(),
      label: `Option ${optionNumber}`,
      value: `option-${optionNumber}`,
    };
    
    dispatch({
      type: 'ADD_OPTION',
      payload: {
        fieldsetId,
        fieldId,
        option,
      },
    });
  };

  // Update an option in a multi-choice field
  const updateOption = (fieldsetId: string, fieldId: string, optionId: string, label: string) => {
    dispatch({
      type: 'UPDATE_OPTION',
      payload: {
        fieldsetId,
        fieldId,
        optionId,
        label,
      },
    });
  };

  // Remove an option from a multi-choice field
  const removeOption = (fieldsetId: string, fieldId: string, optionId: string) => {
    dispatch({
      type: 'REMOVE_OPTION',
      payload: {
        fieldsetId,
        fieldId,
        optionId,
      },
    });
  };

  // Set dragging state
  const setIsDragging = (isDragging: boolean) => {
    dispatch({
      type: 'SET_IS_DRAGGING',
      payload: {
        isDragging,
      },
    });
  };

  // Save the form
  const saveForm = async (asDraft: boolean = false) => {
    try {
      const payload = {
        form: {
          ...state,
          lastSaved: new Date(),
          isDraft: asDraft,
        },
      };
      
      // Set up timeout control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const apiUrl = 'https://team.dev.helpabode.com:54292/api/wempro/react-dev/coding-test/gazinafisrafi.gnr@gmail.com';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          // Update local state to reflect the save
          dispatch({
            type: 'SET_FORM_STATE',
            payload: {
              lastSaved: new Date(),
              isDraft: asDraft,
            },
          });
          
          // Show success message
          toast({
            title: asDraft ? 'Draft Saved' : 'Form Saved',
            description: asDraft 
              ? 'Your form draft has been saved.' 
              : 'Your form has been saved successfully.',
          });
        } else {
          // Handle HTTP error responses
          toast({
            title: 'Error saving form',
            description: `Server returned an error: ${response.status} ${response.statusText}`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle network issues or timeouts
        const fetchError = error as Error;
        if (fetchError.name === 'AbortError') {
          toast({
            title: 'Connection timeout',
            description: 'The connection to the form API timed out. Form was not saved.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Network error',
            description: 'Could not connect to the form API. Form was not saved.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error saving form:', error);
      
      // Catch any other unexpected errors
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while saving the form.',
        variant: 'destructive',
      });
    }
  };

  // Helper function to get the selected field and its fieldset
  const getSelectedField = () => {
    if (!state.selectedFieldId) return { field: null, fieldset: null };
    
    for (const fieldset of state.fieldsets) {
      const field = fieldset.fields.find(f => f.id === state.selectedFieldId);
      if (field) {
        return { field, fieldset };
      }
    }
    
    return { field: null, fieldset: null };
  };

  // Combine all functions into the context value
  const contextValue: FormBuilderContextProps = {
    state,
    addFieldset,
    addField,
    removeField,
    removeFieldset,
    duplicateField,
    updateField,
    updateFieldset,
    selectField,
    selectFieldset,
    moveField,
    moveFieldset,
    addOption,
    updateOption,
    removeOption,
    setIsDragging,
    saveForm,
    getSelectedField,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Loading form builder...</p>
        </div>
      </div>
    );
  }

  return (
    <FormBuilderContext.Provider value={contextValue}>
      {children}
    </FormBuilderContext.Provider>
  );
};

// Custom hook for using the context
export const useFormBuilder = (): FormBuilderContextProps => {
  const context = useContext(FormBuilderContext);
  
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  
  return context;
};
