import { Field, FieldType } from '@/types';

export const generateGroupTemplate = (template: string, formId: string): Field[] => {
    const groupFieldId = crypto.randomUUID();
    const fields: Field[] = [];

    // 1. Create the Container Group
    const groupField: Field = {
        id: groupFieldId,
        formId: formId,
        type: FieldType.GROUP,
        label: template === 'address' ? 'Address Block' : 
               template === 'contact' ? 'Contact Information' : 'Shipping Details',
        required: false,
        order: 0, // Will be adjusted by caller
        options: { collapsible: true }
    };
    fields.push(groupField);

    // 2. Create Child Fields based on Template
    if (template === 'address') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXTAREA, label: 'Street Address', order: 0, required: true, options: { subLabel: '' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'City', order: 1, required: true, options: { subLabel: '' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'State / Province', order: 2, required: true, options: { subLabel: '' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Zip / Postal Code', order: 3, required: true, options: { subLabel: '' }
        });
    } else if (template === 'contact') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.FULLNAME, label: 'Full Name', order: 0, required: true, options: { subLabel: '' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.EMAIL, label: 'Email Address', order: 1, required: true, options: { subLabel: '' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.PHONE, label: 'Phone Number', order: 2, required: false, options: { subLabel: '' }
        });
    } else if (template === 'shipping') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.ADDRESS, label: 'Shipping Address', order: 0, required: true, options: { subLabel: '' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.DATE, label: 'Preferred Delivery Date', order: 1, required: true, options: { subLabel: '' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXTAREA, label: 'Delivery Instructions', order: 2, required: false, options: { subLabel: '' }
        });
    } else if (template === 'employment') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Company Name', order: 0, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Job Title', order: 1, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.DATE, label: 'Start Date', order: 2, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.DATE, label: 'End Date', order: 3, required: false, options: {}
        });
    } else if (template === 'education') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'School / University', order: 0, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Degree', order: 1, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.NUMBER, label: 'Graduation Year', order: 2, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.NUMBER, label: 'GPA', order: 3, required: false, options: {}
        });
    } else if (template === 'feedback') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.RATE, label: 'Rating', order: 0, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXTAREA, label: 'Comments', order: 1, required: false, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.FULLNAME, label: 'Your Name', order: 2, required: false, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.EMAIL, label: 'Email', order: 3, required: false, options: {}
        });
    } else if (template === 'event') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.FULLNAME, label: 'Attendee Name', order: 0, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.EMAIL, label: 'Email Address', order: 1, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.DROPDOWN, label: 'Ticket Type', order: 2, required: true, options: {
                choices: [
                    { id: 'vip', label: 'VIP' },
                    { id: 'standard', label: 'Standard' },
                    { id: 'student', label: 'Student' }
                ]
            }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXTAREA, label: 'Dietary Restrictions', order: 3, required: false, options: {}
        });
    } else if (template === 'login') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Username', order: 0, required: true, options: {}
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Password', order: 1, required: true, options: { 
               // Note: Standard fields might not have 'password' type, using TEXT for now or verify if PASSWORD type exists? 
               // Assuming TEXT with custom handling or just label 'Password'. 
               // If you have a PASSWORD field type, use it. Based on imports, likely no specific Password type yet, so TEXT is safest.
               placeholder: '••••••••'
            }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.CHECKBOX, label: 'Remember Me', order: 2, required: false, options: {
                choices: [{ id: 'remember', label: 'Remember Me' }]
            }
        });
    } else if (template === 'payment') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.NUMBER, label: 'Card Number', order: 0, required: true, options: { placeholder: '0000 0000 0000 0000' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Expiry Date', order: 1, required: true, options: { placeholder: 'MM/YY' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.NUMBER, label: 'CVV', order: 2, required: true, options: { placeholder: '123' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Cardholder Name', order: 3, required: true, options: {}
        });
    } else if (template === 'social') {
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'LinkedIn Profile', order: 0, required: false, options: { placeholder: 'https://linkedin.com/in/...' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Twitter Handle', order: 1, required: false, options: { placeholder: '@username' }
        });
        fields.push({
            id: crypto.randomUUID(), formId: formId, groupId: groupFieldId, type: FieldType.TEXT, label: 'Portfolio URL', order: 2, required: false, options: { placeholder: 'https://...' }
        });
    }

    return fields;
};
