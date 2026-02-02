export interface ActiveUser {
    id: string;
    name: string;
    email: string;
    color: string;
    selectedFieldId: string | null;
    socketId: string;
}

export interface FieldSelectionPayload {
    formId: string;
    fieldId: string;
    userId: string;
}

export interface JoinFormPayload {
    formId: string;
    userId: string;
    userName: string;
    userEmail: string;
}
