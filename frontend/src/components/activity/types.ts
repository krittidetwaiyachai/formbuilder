export interface ActivityLog {
    id: string;
    action: string;
    details: any;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        photoUrl?: string;
    };
}
