import { Field } from '@/types';

export function splitIntoPages(fields: Field[]): Field[][] {
  const pages: Field[][] = [];
  let currentPage: Field[] = [];

  fields.forEach(field => {
    if (field.type === 'PAGE_BREAK') {
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
      }
    } else {
      currentPage.push(field);
    }
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [fields];
}

export function flattenFields(fields: Field[]): Field[] {
  const byGroupId: Record<string, Field[]> = {};
  const roots: Field[] = [];

  fields.forEach(field => {
    if (field.groupId) {
      if (!byGroupId[field.groupId]) byGroupId[field.groupId] = [];
      byGroupId[field.groupId].push(field);
    } else {
      roots.push(field);
    }
  });

  roots.sort((a, b) => a.order - b.order);
  Object.values(byGroupId).forEach(children => {
    children.sort((a, b) => a.order - b.order);
  });

  const visit = (field: Field): Field[] => {
    const result = [field];
    const children = byGroupId[field.id] || [];
    children.forEach(child => {
      result.push(...visit(child));
    });
    return result;
  };

  const flatList: Field[] = [];
  roots.forEach(root => {
    flatList.push(...visit(root));
  });

  return flatList;
}
