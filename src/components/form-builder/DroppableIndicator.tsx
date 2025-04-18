interface DroppableIndicatorProps {
    message: string;
  }
  
  export default function DroppableIndicator({ message }: DroppableIndicatorProps) {
    return (
      <div className="border-2 border-dashed border-[#FF0000]/30 rounded-lg p-3 text-center bg-[#FF0000]/5 mb-3">
        <p className="text-sm text-[#FF0000]/70">{message}</p>
      </div>
    );
  }
  