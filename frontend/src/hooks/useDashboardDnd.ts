import { useState } from 'react';
import { useSensor, useSensors, PointerSensor, TouchSensor, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useFolders } from './useFolders';
import { FormWithStats } from './useDashboardForms';

interface UseDashboardDndOptions {
  forms: FormWithStats[];
  onRefresh: () => Promise<void>;
}

export function useDashboardDnd({ onRefresh }: UseDashboardDndOptions) {
  const { moveFormToFolder, refreshFolders } = useFolders();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 15,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const formId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('folder-')) {
      const folderId = overId.replace('folder-', '');
      await moveFormToFolder(formId, folderId);
      await onRefresh();
      await refreshFolders();
    } else if (overId === 'ungrouped') {
      await moveFormToFolder(formId, null);
      await onRefresh();
      await refreshFolders();
    }
  };

  return {
    activeId,
    setActiveId,
    sensors,
    handleDragStart,
    handleDragEnd,
  };
}
