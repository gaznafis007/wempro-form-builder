import { useRef, useState, useEffect } from 'react';
import { FieldType } from '../types/formbuilder';
import { useFormBuilder } from '../context/FormBuilderContext';

interface UseDragProps {
  type: 'palette-item' | 'field-item' | 'fieldset';
  fieldType?: FieldType;
  fieldId?: string;
  fieldsetId?: string;
}

interface UseDragResult {
  isDragging: boolean;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const useDrag = ({ type, fieldType, fieldId, fieldsetId }: UseDragProps): UseDragResult => {
  const [isDragging, setIsDragging] = useState(false);
  const dragNode = useRef<HTMLDivElement | null>(null);
  const { setIsDragging: setGlobalDragging } = useFormBuilder();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    dragNode.current = e.target as HTMLDivElement;
    
    // Set data transfer
    if (type === 'palette-item' && fieldType) {
      e.dataTransfer.setData('type', 'palette-item');
      e.dataTransfer.setData('fieldType', fieldType);
    } else if (type === 'field-item' && fieldId && fieldsetId) {
      e.dataTransfer.setData('type', 'field-item');
      e.dataTransfer.setData('fieldId', fieldId);
      e.dataTransfer.setData('fieldsetId', fieldsetId);
    } else if (type === 'fieldset' && fieldsetId) {
      e.dataTransfer.setData('type', 'fieldset');
      e.dataTransfer.setData('fieldsetId', fieldsetId);
    }
    
    e.dataTransfer.effectAllowed = 'move';
    
    // Set dragging state
    setIsDragging(true);
    setGlobalDragging(true);
    
    // Remove focus from the current element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    dragNode.current = null;
    setIsDragging(false);
    setGlobalDragging(false);
  };

  // Clean up dragging state when component unmounts
  useEffect(() => {
    return () => {
      if (isDragging) {
        setGlobalDragging(false);
      }
    };
  }, [isDragging, setGlobalDragging]);

  return {
    isDragging,
    handleDragStart,
    handleDragEnd,
  };
};

interface UseDropProps {
  type: 'fieldset' | 'canvas';
  fieldsetId?: string;
  onDrop: (data: Record<string, string>) => void;
}

interface UseDropResult {
  isOver: boolean;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const useDrop = ({ type, fieldsetId, onDrop }: UseDropProps): UseDropResult => {
  const [isOver, setIsOver] = useState(false);
  const dropCounter = useRef(0);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dropCounter.current += 1;
    
    // Only set isOver to true when drag enters the component
    if (dropCounter.current === 1) {
      setIsOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dropCounter.current -= 1;
    
    // Only set isOver to false when drag leaves the component
    if (dropCounter.current === 0) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dropCounter.current = 0;
    setIsOver(false);
    
    // Get data from dataTransfer
    const dataType = e.dataTransfer.getData('type');
    
    // Build data object
    const data: Record<string, string> = { type: dataType };
    
    if (dataType === 'palette-item') {
      data.fieldType = e.dataTransfer.getData('fieldType');
    } else if (dataType === 'field-item') {
      data.fieldId = e.dataTransfer.getData('fieldId');
      data.sourceFieldsetId = e.dataTransfer.getData('fieldsetId');
    } else if (dataType === 'fieldset') {
      data.fieldsetId = e.dataTransfer.getData('fieldsetId');
    }
    
    if (type === 'fieldset' && fieldsetId) {
      data.targetFieldsetId = fieldsetId;
    }
    
    // Call the onDrop callback with the data
    onDrop(data);
  };

  return {
    isOver,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
};
