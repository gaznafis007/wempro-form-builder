interface DroppableIndicatorProps {
    message: string;
  }
  
  export default function DroppableIndicator({ message }: DroppableIndicatorProps) {
    return (
      <div className="border-2 border-dashed border-[#4A6CF7]/30 rounded-lg p-3 text-center bg-[#4A6CF7]/5 mb-3">
        <p className="text-sm text-[#4A6CF7]/70">{message}</p>
      </div>
    );
  }
  