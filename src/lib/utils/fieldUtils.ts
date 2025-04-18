// Generate a unique ID
export const generateUniqueId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Generate a unique name based on a base name and existing names
  export const generateUniqueName = (baseName: string, existingNames: string[]): string => {
    // If the base name doesn't exist yet, use it
    if (!existingNames.includes(baseName)) {
      return baseName;
    }
    
    // Check for names with a number suffix
    const regex = new RegExp(`^${baseName} copy(\\d*)$`);
    
    // Filter and extract the highest number
    const numbers = existingNames
      .map(name => {
        const match = name.match(regex);
        if (match) {
          return match[1] ? parseInt(match[1], 10) : 1;
        }
        return 0;
      })
      .filter(num => num > 0);
    
    // Get the highest number or 0 if none
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    
    // Generate a new name with an incremented number
    return maxNumber > 0
      ? `${baseName} copy${maxNumber + 1}`
      : `${baseName} copy`;
  };
  
  // Transform a label into a valid field name
  export const labelToFieldName = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
  };
  
  // Check if a field name is unique in a fieldset
  export const isFieldNameUnique = (
    name: string,
    currentFieldId: string,
    fields: { id: string; name: string }[]
  ): boolean => {
    return !fields.some(field => field.name === name && field.id !== currentFieldId);
  };
  