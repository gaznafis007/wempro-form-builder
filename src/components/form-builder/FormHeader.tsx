import { useFormBuilder } from '../../context/FormBuilderContext';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function FormHeader() {
  const { state } = useFormBuilder();
  
  // Format the last saved time
  const getLastSavedText = () => {
    if (!state.lastSaved) return 'Not saved yet';
    
    try {
      return `Changes saved ${formatDistanceToNow(state.lastSaved, { addSuffix: false })} ago`;
    } catch (error) {
      return 'Recently saved';
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 py-3 px-4 flex justify-between items-center">
      <div className="flex items-center">
        <div className="flex items-center mr-2">
            <img className='w-10 h-10' src='/images/wempro_com_logo.jpg' alt='wempro_logo'/>
          {/* <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 rounded-lg">
            <rect width="36" height="36" rx="8" fill="#F7F7F9"/>
            <path d="M18 8C12.477 8 8 12.477 8 18C8 23.523 12.477 28 18 28C23.523 28 28 23.523 28 18C28 12.477 23.523 8 18 8Z" fill="#4A6CF7"/>
            <path d="M22 14H14V22H22V14Z" fill="#FF564D"/>
            <path d="M26 10H18V18H26V10Z" fill="#00D084"/>
          </svg> */}
        </div>
        <div>
          <h1 className="text-lg font-bold">Form Builder</h1>
          <p className="text-xs text-neutral-500">Add and customize forms for your needs</p>
        </div>
      </div>
      
      <div className="flex items-center text-sm text-neutral-600">
        <span className="mr-2">{getLastSavedText()}</span>
        <button className="p-1 rounded-full hover:bg-neutral-100">
          <Eye size={16} />
        </button>
      </div>
    </header>
  );
}
