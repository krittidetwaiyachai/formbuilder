import { useDraggable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DraggableFormCardProps {
  formId: string;
  children: ReactNode;
}

export default function DraggableFormCard({ formId, children }: DraggableFormCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: formId,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-50' : ''}
      style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {children}
    </div>
  );
}
