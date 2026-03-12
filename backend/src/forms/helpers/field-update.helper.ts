import { Prisma } from '@prisma/client';
import { CreateFieldDto, CreateLogicConditionDto, CreateLogicActionDto } from '../dto/create-form.dto';
export class FieldUpdateHelper {
  static identifyFieldOperations(existingFields: {id: string;}[], incomingFields: CreateFieldDto[]) {
    const existingFieldIds = new Set(existingFields.map((f) => f.id));
    const incomingFieldIds = new Set(incomingFields.map((f) => f.id));
    const toDelete = existingFields.filter((f) => !incomingFieldIds.has(f.id));
    const toCreate = incomingFields.filter((f) => !existingFieldIds.has(f.id));
    const toUpdate = incomingFields.filter((f) => existingFieldIds.has(f.id));
    return { toDelete, toCreate, toUpdate };
  }
  static prepareFieldForCreate(field: CreateFieldDto, formId: string) {
    const { shrink, ...rest } = field;
    return {
      ...rest,
      id: field.id,
      formId: formId,
      order: field.order ?? 0,
      groupId: null
    };
  }
  static prepareFieldForUpdate(field: CreateFieldDto) {
    const { shrink, ...rest } = field;
    return {
      ...rest,
      groupId: null
    };
  }
  static filterValidLogicItems(items: (CreateLogicConditionDto | CreateLogicActionDto)[], validFieldIds: Set<string>) {
    return items.filter((item) => {
      if (!item.fieldId) return true;
      return validFieldIds.has(item.fieldId);
    });
  }
}