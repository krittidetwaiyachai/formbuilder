export interface ChangeItem {
    property: string;
    before?: unknown;
    after?: unknown;
}

export interface FieldChange {
    id: string;
    label: string;
    type: string;
    groupId?: string;
    changes: ChangeItem[];
}

export interface LogicCondition {
    fieldId: string;
    operator: string;
    value?: unknown;
}

export interface LogicAction {
    type: string;
    fieldId: string;
    value?: unknown;
}

export interface LogicRuleChange {
    id: string;
    name: string;
    conditions?: LogicCondition[];
    actions?: LogicAction[];
    logicType?: string;
    originalConditions?: LogicCondition[];
    originalActions?: LogicAction[];
    originalType?: string;
    changes: ChangeItem[];
}

export interface LogicChanges {
    added?: LogicRuleChange[];
    deleted?: LogicRuleChange[];
    updated?: LogicRuleChange[];
}

export interface ActivityLogDetails {
    title?: string;
    changes?: string[];
    addedFields?: FieldChange[];
    deletedFields?: FieldChange[];
    updatedFields?: FieldChange[];
    logicChanges?: LogicChanges;
    settingsChanges?: ChangeItem[];
}

export interface ActivityLog {
    id: string;
    action: string;
    details: ActivityLogDetails;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        photoUrl?: string;
    };
}
