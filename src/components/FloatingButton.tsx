
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface FloatingButtonProps {
  isListening: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
}

const FloatingButton = ({ isListening, onToggle, isDisabled = false }: FloatingButtonProps) => {
  return (
    <Button
      onClick={onToggle}
      disabled={isDisabled}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      size="icon"
    >
      {isListening ? (
        <Square className="w-6 h-6" />
      ) : (
        <Play className="w-6 h-6" />
      )}
    </Button>
  );
};

export default FloatingButton;
