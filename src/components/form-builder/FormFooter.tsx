import { Button } from '../ui/button';

interface FormFooterProps {
  onSave: () => void;
  onDraft: () => void;
}

export default function FormFooter({ onSave, onDraft }: FormFooterProps) {
  return (
    <footer className="bg-white border-t border-neutral-200 py-3 px-4 flex justify-end space-x-2">
      <Button 
        variant="outline" 
        className="py-2 px-6 bg-neutral-50 hover:bg-neutral-100"
        onClick={onDraft}
      >
        Draft
      </Button>
      
      <Button 
        className="py-2 px-6 bg-[#FF564D] hover:bg-[#FF564D]/90 text-white"
        onClick={onSave}
      >
        Save Form
      </Button>
    </footer>
  );
}
