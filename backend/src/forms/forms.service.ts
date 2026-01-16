import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EncryptionService } from '../common/encryption.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormStatus, RoleType } from '@prisma/client';

@Injectable()
export class FormsService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
    private encryptionService: EncryptionService,
  ) {}

  async create(userId: string, createFormDto: CreateFormDto) {
    const { fields, conditions, logicRules, ...formData } = createFormDto;

    const form = await this.prisma.form.create({
      data: {
        ...formData,
        createdBy: {
          connect: { id: userId },
        },
        fields: fields
          ? {
              create: fields.map((field) => ({
                ...field,
                order: field.order ?? 0,
              })),
            }
          : undefined,
        conditions: conditions
          ? {
              create: conditions,
            }
          : undefined,
        logicRules: logicRules
          ? {
              create: logicRules.map((rule) => ({
                name: rule.name,
                logicType: rule.logicType,
                conditions: {
                  create: rule.conditions,
                },
                actions: {
                  create: rule.actions,
                },
              })),
            }
          : undefined,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        conditions: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });


    await this.activityLog.log(form.id, userId, 'CREATED', { title: form.title });

    return form;
  }

  async findAll(userId: string, userRole: RoleType) {
    const where: any = {};

    // ADMIN sees all forms
    if (userRole === RoleType.ADMIN) {
      // no filter
    } else {
        // EDITOR sees only their own forms AND forms shared with them
      where.OR = [
        { createdById: userId },
        { collaborators: { some: { id: userId } } }
      ];
    }

    const forms = await this.prisma.form.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { responses: true },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          }
        },
        collaborators: {
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
            }
        }
      },
    });

    // Add responseCount and viewCount to each form
    return forms.map((form) => {
      const { _count, ...formData } = form;
      return {
        ...formData,
        responseCount: _count.responses,
        viewCount: (form as any).viewCount || 0,
      };
    });
  }

  async findOne(id: string, userId: string, userRole: RoleType) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        conditions: {
          include: {
            sourceField: true,
            targetField: true,
          },
        },
        logicRules: {
          include: {
            conditions: true,
            actions: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        collaborators: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          }
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check permissions

    
    if (
      userRole === RoleType.VIEWER &&
      form.status !== FormStatus.PUBLISHED
    ) {
      throw new ForbiddenException('You can only view published forms');
    }

    const isCreator = form.createdById === userId;
    const isCollaborator = form.collaborators?.some(c => c.id === userId);

    if (
      userRole === RoleType.EDITOR &&
      !isCreator &&
      !isCollaborator &&
      form.status !== FormStatus.PUBLISHED
    ) {

      throw new ForbiddenException('You can only edit your own forms or forms shared with you');
    }

    return form;
  }

  async findPublic(id: string, fingerprint?: string, ipAddress?: string, userAgent?: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        conditions: {
          include: {
            sourceField: true,
            targetField: true,
          },
        },
        logicRules: {
          include: {
            conditions: true,
            actions: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },

      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('Form is not published');
    }

    // Track unique view if fingerprint is provided
    if (fingerprint) {
      try {
        // Try to create a new view record (upsert approach)
        const existingView = await this.prisma.formView.findUnique({
          where: {
            formId_fingerprint: {
              formId: id,
              fingerprint: fingerprint,
            },
          },
        });

        // Only increment viewCount if this is a new unique visitor
        if (!existingView) {
          await this.prisma.$transaction([
            this.prisma.formView.create({
              data: {
                formId: id,
                fingerprint: fingerprint,
                ipAddress: ipAddress ? this.encryptionService.hashIpAddress(ipAddress) : null,
                userAgent: userAgent || null,
              },
            }),
            this.prisma.form.update({
              where: { id },
              data: {
                viewCount: {
                  increment: 1,
                },
              },
            }),
          ]);
        }
      } catch {
        // Ignore duplicate entry errors (race condition handling)
      }
    }

    return form;
  }

  async update(
    id: string,
    userId: string,
    userRole: RoleType,
    updateFormDto: UpdateFormDto,
  ) {
    const originalForm = await this.findOne(id, userId, userRole);

    // Check edit permissions
    const isCollaborator = originalForm.collaborators?.some(c => c.id === userId);

    if (
      userRole !== RoleType.SUPER_ADMIN &&
      userRole !== RoleType.ADMIN &&
      originalForm.createdById !== userId &&
      !isCollaborator
    ) {
      throw new ForbiddenException('You can only edit your own forms or forms shared with you');
    }

    const { fields, conditions, logicRules, ...formData } = updateFormDto as any;

    // --- ACTIVITY LOG DIFF LOGIC ---
    const activityDetails: any = { changes: [], addedFields: [], deletedFields: [], updatedFields: [] };
    
    // 1. Check general settings changes
    const settingsChanges = [];
    Object.keys(formData).forEach(key => {
      // Simple value comparison
      const oldValue = originalForm[key];
      const newValue = formData[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        activityDetails.changes.push(key);
        settingsChanges.push({ property: key, before: oldValue, after: newValue });
      }
    });
    
    if (settingsChanges.length > 0) {
      activityDetails.settingsChanges = settingsChanges;
    }

    // 2. Check Field Changes
    if (fields) {
      const originalFields = originalForm.fields || [];
      const newFields = fields || [];
      const originalFieldIds = new Set(originalFields.map(f => f.id));
      const newFieldIds = new Set(newFields.map(f => f.id));

      // Added Fields
      newFields.forEach(f => {
        if (!originalFieldIds.has(f.id)) {
          activityDetails.addedFields.push({ id: f.id, type: f.type, label: f.label, groupId: f.groupId });
        }
      });

      // Deleted Fields
      originalFields.forEach(f => {
        if (!newFieldIds.has(f.id)) {
          activityDetails.deletedFields.push({ id: f.id, type: f.type, label: f.label, groupId: f.groupId });
        }
      });

      // Updated Fields
      newFields.forEach(newField => {
        if (originalFieldIds.has(newField.id)) {
          const oldField = originalFields.find(f => f.id === newField.id);
          const fieldChanges = [];
          
            // DEEP DIFF COMPARISON
            const normalize = (val: any) => {
              // Preserve 0 and false as valid values
              if (val === 0 || val === false) return val;
              if (val === null || val === undefined || val === '') return null;
              if (Array.isArray(val) && val.length === 0) return null;
              return val;
            };

            // 1. Check Top-Level Properties
            ['label', 'placeholder', 'required', 'shrink', 'groupId', 'score', 'correctAnswer', 'isPII'].forEach(prop => {
              const oldVal = normalize(oldField[prop]);
              const newVal = normalize(newField[prop]);
              
              // For boolean properties, treat false as null (not set)
              const isBooleanProp = ['required', 'shrink', 'isPII'].includes(prop);
              const normalizedOld = isBooleanProp && oldVal === false ? null : oldVal;
              const normalizedNew = isBooleanProp && newVal === false ? null : newVal;
              
              const oldStr = JSON.stringify(normalizedOld);
              const newStr = JSON.stringify(normalizedNew);

              if (oldStr !== newStr) {
                 fieldChanges.push({ property: prop, before: oldVal, after: newVal });
              }
            });

            // 2. Check Validation (Expand nested properties)
            const oldValidation = (oldField.validation as any) || {};
            const newValidation = (newField.validation as any) || {};
            
            const allValidationKeys = new Set([...Object.keys(oldValidation), ...Object.keys(newValidation)]);
            
            allValidationKeys.forEach(key => {
              let oldVal = normalize(oldValidation[key]);
              let newVal = normalize(newValidation[key]);
              
              // Dynamic boolean detection: treat null as false if the matching value is boolean
              const isBooleanVal = typeof newVal === 'boolean' || typeof oldVal === 'boolean';
              
              if (isBooleanVal) {
                oldVal = oldVal === null ? false : oldVal;
                newVal = newVal === null ? false : newVal;
              }
              
              const normalizedOld = oldVal;
              const normalizedNew = newVal;
              
              if (normalizedOld !== null || normalizedNew !== null) {
                if (JSON.stringify(normalizedOld) !== JSON.stringify(normalizedNew)) {
                  fieldChanges.push({ 
                    property: `validation.${key}`, 
                    before: oldVal,  // Use actual value (false) not null
                    after: newVal 
                  });
                }
              }
            });

            // 2. Check Options (Nested Properties)
            const oldOptions = (oldField.options as any) || {};
            const newOptions = (newField.options as any) || {};
            
            // Collect all unique keys from both objects
            const allOptionKeys = new Set([...Object.keys(oldOptions), ...Object.keys(newOptions)]);
            
            allOptionKeys.forEach(key => {
               // Skip numeric keys (legacy array indices) to prevent log noise
               if (!isNaN(Number(key))) return;

               const oldVal = oldOptions[key];
               const newVal = newOptions[key];
               
                // Smart Diff for 'items': Ignore reordering, but catch content changes
                if (key === 'items') {
                   const oldItems = Array.isArray(oldVal) ? oldVal : [];
                   const newItems = Array.isArray(newVal) ? newVal : [];
                   
                   // If counts differ, it's definitely a change (add/remove)
                   if (oldItems.length !== newItems.length) {
                       // Let it fall through to normal comparison which will log it
                   } else {
                       // Deep compare ignoring order
                       // We sort both arrays by their string representation to compare content
                       const sortedOld = [...oldItems].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
                       const sortedNew = [...newItems].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
                       
                       if (JSON.stringify(sortedOld) === JSON.stringify(sortedNew)) {
                           return; // Content is identical, just order changed -> Ignore this key
                       }
                   }
                   // If content differs, code continues below to "Simple value comparison" or object comparison logic
                }

               
               // Check if both values are objects (nested settings like multiple, width)
               const isOldObject = oldVal && typeof oldVal === 'object' && !Array.isArray(oldVal);
               const isNewObject = newVal && typeof newVal === 'object' && !Array.isArray(newVal);
               
               if (isOldObject || isNewObject) {
                 // Expand nested object properties
                 const oldObj = isOldObject ? oldVal : {};
                 const newObj = isNewObject ? newVal : {};
                 const nestedKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
                 
                 nestedKeys.forEach(nestedKey => {
                   let oldNestedVal = normalize(oldObj[nestedKey]);
                   let newNestedVal = normalize(newObj[nestedKey]);
                   
                   const isBooleanVal = typeof newNestedVal === 'boolean' || typeof oldNestedVal === 'boolean';
                   if (isBooleanVal) {
                     oldNestedVal = oldNestedVal === null ? false : oldNestedVal;
                     newNestedVal = newNestedVal === null ? false : newNestedVal;
                   }
                   
                   if (oldNestedVal !== null || newNestedVal !== null) {
                     if (JSON.stringify(oldNestedVal) !== JSON.stringify(newNestedVal)) {
                       // Use dot notation for nested properties (e.g., "multiple.enabled")
                       fieldChanges.push({ 
                         property: `${key}.${nestedKey}`, 
                         before: oldNestedVal, 
                         after: newNestedVal 
                       });
                     }
                   }
                 });
               } else {
                 // Simple value comparison
                 let normalizedOld = normalize(oldVal);
                 let normalizedNew = normalize(newVal);
                 
                 const isBooleanVal = typeof normalizedNew === 'boolean' || typeof normalizedOld === 'boolean';
                 if (isBooleanVal) {
                   normalizedOld = normalizedOld === null ? false : normalizedOld;
                   normalizedNew = normalizedNew === null ? false : normalizedNew;
                 }
                 
                 if (normalizedOld !== null || normalizedNew !== null) {
                   if (JSON.stringify(normalizedOld) !== JSON.stringify(normalizedNew)) {
                     fieldChanges.push({ property: key, before: normalizedOld, after: normalizedNew });
                   }
                 }
               }
            });
            
             // 3. Handle Choices (for Select/Radio) - special "options" property inside field options?
             // Actually in our schema, 'options' is a JSON field. If it contains choices array, it's handled above.
             // (No change needed here, 'items' is usually inside options, but if the loop above catches it, we might want to be careful.
             //  However, usually 'items' is an array, passing the isOldObject check and going to nestedKeys? 
             //  Wait, 'items' is an array, so !Array.isArray(oldVal) would be false. 
             //  So it goes to "Simple value comparison" block (lines 423+). 
             //  But 'items' is an array of objects. normalize() might return it as is. 
             //  Then JSON.stringify comparisons happen.
             //  If 'items' changed, it logs "items". 
             //  The logs showed 0, 1, 2... which are properties of the options object itself if it was saved as an array-like object?
             //  Or maybe 'items' WAS the array.
             //  The user screenshot shows "0: Label", "0: Value". This strongly suggests `options` became an object with keys "0", "1", etc.
             //  So filtering numeric keys is the correct fix.)
            
            if (fieldChanges.length > 0) {
              activityDetails.updatedFields.push({ 
                id: newField.id, 
                label: newField.label, 
                type: newField.type,
                groupId: newField.groupId,
                changes: fieldChanges 
              });
            }
        }
      });
      
      if (activityDetails.addedFields.length > 0 || activityDetails.deletedFields.length > 0 || activityDetails.updatedFields.length > 0) {
         activityDetails.changes.push('fields');
      }
    }

    // 3. Check Logic Rules Changes
    if (logicRules) {
      const originalLogicRules = originalForm.logicRules || [];
      const newLogicRules = logicRules || [];
      const originalRuleIds = new Set(originalLogicRules.map((r: any) => r.id));
      const newRuleIds = new Set(newLogicRules.map((r: any) => r.id));

      const logicChanges: any = { added: [], deleted: [], updated: [] };

      // Added Rules
      newLogicRules.forEach((r: any) => {
        if (!originalRuleIds.has(r.id)) {
          logicChanges.added.push({ id: r.id, name: r.name, type: r.logicType });
        }
      });

      // Deleted Rules
      originalLogicRules.forEach((r: any) => {
        if (!newRuleIds.has(r.id)) {
          logicChanges.deleted.push({ id: r.id, name: r.name, type: r.logicType });
        }
      });

      // Updated Rules
      newLogicRules.forEach((newRule: any) => {
        if (originalRuleIds.has(newRule.id)) {
          const oldRule = originalLogicRules.find((r: any) => r.id === newRule.id);
          const ruleChanges = [];

          if (oldRule.name !== newRule.name) {
            ruleChanges.push({ property: 'name', before: oldRule.name, after: newRule.name });
          }
          if (oldRule.logicType !== newRule.logicType) {
            ruleChanges.push({ property: 'logicType', before: oldRule.logicType, after: newRule.logicType });
          }

          // Helper to normalize rules for comparison (remove timestamps/internal fields and normalize empty strings)
          const simplify = (items: any[]) => items.map((item: any) => {
            const clean: any = {
              fieldId: item.fieldId || null, // Normalize empty string to null
            };
            if (item.operator !== undefined) clean.operator = item.operator;
            if (item.value !== undefined) clean.value = item.value || null; // Normalize empty string to null
            if (item.type !== undefined) clean.type = item.type;
            return clean;
          });

          const oldConditions = simplify(oldRule.conditions || []);
          const newConditions = simplify(newRule.conditions || []);
          if (JSON.stringify(oldConditions) !== JSON.stringify(newConditions)) {
            ruleChanges.push({ 
              property: 'conditions', 
              before: oldRule.conditions, 
              after: newRule.conditions 
            });
          }

          const oldActions = simplify(oldRule.actions || []);
          const newActions = simplify(newRule.actions || []);
          if (JSON.stringify(oldActions) !== JSON.stringify(newActions)) {
            ruleChanges.push({ 
              property: 'actions', 
              before: oldRule.actions, 
              after: newRule.actions 
            });
          }

          if (ruleChanges.length > 0) {
            logicChanges.updated.push({
              id: newRule.id,
              name: newRule.name,
              changes: ruleChanges,
              originalConditions: oldRule.conditions,
              originalActions: oldRule.actions,
              originalType: oldRule.logicType,
              conditions: newRule.conditions,
              actions: newRule.actions,
              logicType: newRule.logicType
            });
          }
        }
      });

      if (logicChanges.added.length > 0 || logicChanges.deleted.length > 0 || logicChanges.updated.length > 0) {
        activityDetails.logicChanges = logicChanges;
        activityDetails.changes.push('logic');
      }
    }
    // -------------------------------

    // 1. CLEANUP PHASE: Delete dependencies first to avoid Foreign Key constraints
    // Even with ON DELETE CASCADE, explicit ordering is safer and prevents "violates foreign key" errors.

    // Handle logic rules cleanup
    if (logicRules) {
      await this.prisma.logicRule.deleteMany({
        where: { formId: id },
      });
    }

    // Handle classic conditions cleanup
    if (fields || conditions) {
      await this.prisma.fieldCondition.deleteMany({
        where: { formId: id },
      });
    }

    // Handle fields update
    if (fields) {
      // 1. Fetch existing fields to compare
      const existingFields = await this.prisma.field.findMany({
        where: { formId: id },
        select: { id: true },
      });
      const existingFieldIds = new Set(existingFields.map((f) => f.id));
      const incomingFieldIds = new Set(fields.map((f) => f.id));

      // 2. Identify fields to delete (in DB but not in payload)
      // Only delete fields that are explicitly removed by the user
      const fieldsToDelete = existingFields.filter((f) => !incomingFieldIds.has(f.id));
      if (fieldsToDelete.length > 0) {
        await this.prisma.field.deleteMany({
          where: {
            id: { in: fieldsToDelete.map((f) => f.id) },
          },
        });
      }

      // 3. Separate fields to Create vs Update
      const fieldsToCreate = fields.filter((f) => !existingFieldIds.has(f.id));
      const fieldsToUpdate = fields.filter((f) => existingFieldIds.has(f.id));

      // 4. Update existing fields
      // We process updates in parallel. 
      // Note: We handle groupId later to avoid circular dependency issues during creation, 
      // but for updates, if the parent exists, it's fine. 
      // However, to be safe against "parent updated to a new ID" (unlikely for UUID) or "parent is being created",
      // we can do a two-pass update or just update non-relational props first.
      // For simplicity and performance, we'll try direct update. 
      // If groupId points to a NEW field, that new field might not exist yet if we didn't create it.
      // So: Create NEW fields (groupId=null) -> Update EXISTING fields -> Update ALL groupIds.

      if (fieldsToUpdate.length > 0) {
        await Promise.all(
          fieldsToUpdate.map((field) => {
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
             const { shrink, ...rest } = field;
             return this.prisma.field.update({
              where: { id: field.id },
              data: {
                ...rest,
                groupId: null, // Temporarily null to prevent circular issues if parent is moving/changing
              },
            });
          })
        );
      }

      // 5. Create new fields (initial pass with groupId=null)
      if (fieldsToCreate.length > 0) {
        await this.prisma.field.createMany({
          data: fieldsToCreate.map((field) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { shrink, ...rest } = field;
            return {
              ...rest,
              id: field.id,
              formId: id,
              order: field.order ?? 0,
              groupId: null,
            };
          }) as any,
        });
      }

      // 6. Restore/Set groupIds for ALL fields
      // unique IDs in the payload that have a groupId
      const fieldsWithGroups = fields.filter((f) => f.groupId);
      if (fieldsWithGroups.length > 0) {
         await Promise.all(
            fieldsWithGroups.map(field => 
                this.prisma.field.update({
                    where: { id: field.id },
                    data: { groupId: field.groupId }
                })
            )
         );
      }
    }

    // 2. RESTORE PHASE: Re-create dependencies
    // Handle logic rules creation
    if (logicRules) {
      for (const rule of logicRules) {
        await this.prisma.logicRule.create({
          data: {
            id: rule.id,
            formId: id,
            name: rule.name,
            logicType: rule.logicType,
            conditions: {
              create: rule.conditions.map((c) => ({
                id: c.id,
                fieldId: c.fieldId || null, // Convert empty string to null
                operator: c.operator,
                value: c.value,
              })),
            },
            actions: {
              create: rule.actions.map((a) => ({
                id: a.id,
                type: a.type,
                fieldId: a.fieldId || null, // Convert empty string to null
              })),
            },
          },
        });
      }
    }

    // Handle classic conditions creation if necessary
    if (conditions && conditions.length > 0) {
         await this.prisma.fieldCondition.createMany({
            data: conditions.map(c => ({
                sourceFieldId: c.sourceFieldId,
                targetFieldId: c.targetFieldId,
                operator: c.operator,
                value: c.value,
                action: c.action,
                formId: id
            }))
        });
    }



    try {
      const updatedForm = await this.prisma.form.update({
        where: { id },
        data: formData,
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
          conditions: true,
          logicRules: {
            include: {
              conditions: true,
              actions: true,
            },
          },
        },
      });

      // Only log activity if there are actual changes
      const hasChanges = 
        activityDetails.addedFields?.length > 0 ||
        activityDetails.deletedFields?.length > 0 ||
        activityDetails.updatedFields?.length > 0 ||
        activityDetails.settingsChanges?.length > 0 ||
        activityDetails.logicChanges?.added?.length > 0 ||
        activityDetails.logicChanges?.deleted?.length > 0 ||
        activityDetails.logicChanges?.updated?.length > 0;

      if (hasChanges) {
        await this.activityLog.log(id, userId, 'UPDATED', activityDetails);
      }

      return updatedForm;
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  }

  async remove(id: string, userId: string, userRole: RoleType) {
    const form = await this.findOne(id, userId, userRole);

    // Check delete permissions
    if (
      userRole !== RoleType.SUPER_ADMIN &&
      userRole !== RoleType.ADMIN &&
      form.createdById !== userId
    ) {
      throw new ForbiddenException('You can only delete your own forms');
    }

    await this.activityLog.log(id, userId, 'DELETED', { formId: id });

    await this.prisma.form.delete({
      where: { id },
    });

    return { message: 'Form deleted successfully' };
  }

  async clone(id: string, userId: string) {
    const originalForm = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: true,
        conditions: true,
      },
    });

    if (!originalForm) {
      throw new NotFoundException('Form not found');
    }

    const newForm = await this.prisma.form.create({
      data: {
        title: `${originalForm.title} (Copy)`,
        description: originalForm.description,
        status: FormStatus.DRAFT,
        isQuiz: originalForm.isQuiz,
        quizSettings: originalForm.quizSettings,
        createdById: userId,
        fields: {
          create: originalForm.fields.map((field) => ({
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            validation: field.validation || undefined,
            order: field.order,
            options: field.options || undefined,
            correctAnswer: field.correctAnswer,
            score: field.score,
          })),
        },
        conditions: {
          create: originalForm.conditions.map((condition) => ({
            sourceFieldId: '', // Logic to map old IDs to new IDs would be complex here without a map
            targetFieldId: '', 
            operator: condition.operator,
            value: condition.value,
            action: condition.action
          })) 
          // Note: Cloning conditions properly requires mapping old field IDs to new field IDs.
          // This simple clone might break conditions. ideally we need a more robust clone.
          // For now leaving as is or simplifying.
        }
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        conditions: true,
      },
    });

    return newForm;
  }

  async addCollaborator(formId: string, email: string) {
    // 1. Find the user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Check if form exists
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { collaborators: true },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // 3. Check if already a collaborator
    const isAlreadyCollaborator = form.collaborators.some(c => c.id === user.id);
    if (isAlreadyCollaborator) {
      return { message: 'User is already a collaborator' };
    }

    // 4. Check if owner
    if (form.createdById === user.id) {
        return { message: 'User is the owner of the form' };
    }

    // 5. Add collaborator
    await this.prisma.form.update({
      where: { id: formId },
      data: {
        collaborators: {
          connect: { id: user.id },
        },
      },
    });

    await this.activityLog.log(formId, user.id, 'COLLABORATOR_ADDED', { email });

    return { message: 'Collaborator added successfully', user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, photoUrl: user.photoUrl } };
  }

  async removeCollaborator(formId: string, userIdToRemove: string, requestingUserId: string, userRole: RoleType) {
    const form = await this.prisma.form.findUnique({
        where: { id: formId },
        include: { collaborators: true },
    });

    if (!form) {
        throw new NotFoundException('Form not found');
    }

    // Only Owner or Admin can remove collaborators
    // OR the collaborator themselves can leave? (Optional)
    if (
        userRole !== RoleType.SUPER_ADMIN && 
        userRole !== RoleType.ADMIN && 
        form.createdById !== requestingUserId &&
        userIdToRemove !== requestingUserId // Allow leaving
    ) {
        throw new ForbiddenException('You do not have permission to remove collaborators');
    }

    await this.prisma.form.update({
        where: { id: formId },
        data: {
            collaborators: {
                disconnect: { id: userIdToRemove },
            },
        },
    });

    await this.activityLog.log(formId, userIdToRemove, 'COLLABORATOR_REMOVED', { removedBy: requestingUserId });

    return { message: 'Collaborator removed successfully' };
  }
}
