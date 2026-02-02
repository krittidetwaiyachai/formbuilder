import { useState, useEffect, useCallback, useRef } from 'react';
import { collaborationService } from '@/services/collaboration.service';
import { ActiveUser } from '@/types/collaboration';
import { useAuthStore } from '@/store/authStore';

interface UseCollaborationOptions {
    formId: string;
    enabled?: boolean;
}

export const useCollaboration = ({ formId, enabled = true }: UseCollaborationOptions) => {
    const user = useAuthStore((state) => state.user);
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const selectedFieldIdRef = useRef<string | null>(null);
    const isJoinedRef = useRef(false);

    useEffect(() => {
        if (!enabled || !user || !formId) {
            return;
        }

        collaborationService.connect();

        collaborationService.joinForm({
            formId,
            userId: user.id,
            userName: user.firstName || user.email.split('@')[0],
            userEmail: user.email,
        });

        isJoinedRef.current = true;

        const unsubscribe = collaborationService.onActiveUsersUpdate((users) => {
            setActiveUsers(users);
        });

        return () => {
            if (isJoinedRef.current) {
                collaborationService.leaveForm(formId, user.id);
                isJoinedRef.current = false;
            }
            unsubscribe();
        };
    }, [formId, user, enabled]);

    const selectField = useCallback((fieldId: string) => {
        if (!user || !formId) return;

        selectedFieldIdRef.current = fieldId;
        collaborationService.selectField({
            formId,
            fieldId,
            userId: user.id,
        });
    }, [formId, user]);

    const deselectField = useCallback(() => {
        if (!user || !formId) return;

        selectedFieldIdRef.current = null;
        collaborationService.deselectField(formId, user.id);
    }, [formId, user]);

    const getFieldUsers = useCallback((fieldId: string): ActiveUser[] => {
        const currentSocket = collaborationService.getSocket();
        const currentSocketId = currentSocket?.id;
        return activeUsers.filter(u => u.selectedFieldId === fieldId && u.socketId !== currentSocketId);
    }, [activeUsers]);

    const getDebugInfo = useCallback(() => {
        return collaborationService.getDebugInfo();
    }, []);

    return {
        activeUsers,
        selectField,
        deselectField,
        getFieldUsers,
        getDebugInfo,
    };
};
