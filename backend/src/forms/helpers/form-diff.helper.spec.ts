import { FormDiffHelper } from './form-diff.helper';
import { FieldType } from '@prisma/client';

describe('FormDiffHelper', () => {
  describe('calculateDiff', () => {
    it('should return empty changes when forms are identical', () => {
      const original = {
        title: 'Form 1',
        fields: [],
        logicRules: [],
      };
      const nw = {
        title: 'Form 1',
        fields: [],
        logicRules: [],
      };

      const diff = FormDiffHelper.calculateDiff(original, nw);
      expect(diff.changes).toEqual([]);
      expect(diff.settingsChanges).toBeUndefined();
    });

    it('should detect settings changes', () => {
      const original = {
        title: 'Old Title',
        description: 'Old Desc',
        fields: [],
      };
      const nw = {
        title: 'New Title',
        description: 'Old Desc',
        fields: [],
      };

      const diff = FormDiffHelper.calculateDiff(original, nw);
      expect(diff.settingsChanges).toHaveLength(1);
      expect(diff.settingsChanges[0]).toEqual({
        property: 'title',
        before: 'Old Title',
        after: 'New Title',
      });
      expect(diff.changes).toContain('title');
    });

    it('should detect added fields', () => {
      const original = { fields: [] };
      const nw = {
        fields: [
          {
            id: '1',
            type: FieldType.TEXT,
            label: 'Name',
            groupId: null,
          },
        ],
      };

      const diff = FormDiffHelper.calculateDiff(original, nw);
      expect(diff.addedFields).toHaveLength(1);
      expect(diff.addedFields[0]).toMatchObject({ id: '1', label: 'Name' });
      expect(diff.changes).toContain('fields');
    });

    it('should detect deleted fields', () => {
        const original = {
            fields: [
              {
                id: '1',
                type: FieldType.TEXT,
                label: 'Name',
                groupId: null,
              },
            ],
          };
      const nw = { fields: [] };

      const diff = FormDiffHelper.calculateDiff(original, nw);
      expect(diff.deletedFields).toHaveLength(1);
      expect(diff.deletedFields[0].id).toBe('1');
      expect(diff.changes).toContain('fields');
    });

    it('should detect updated field properties', () => {
        const original = {
            fields: [
              {
                id: '1',
                type: FieldType.TEXT,
                label: 'Old Label',
                required: false,
                groupId: null,
              },
            ],
          };
      const nw = {
        fields: [
            {
              id: '1',
              type: FieldType.TEXT,
              label: 'New Label',
              required: true,
              groupId: null,
            },
          ],
      };

      const diff = FormDiffHelper.calculateDiff(original, nw);
      expect(diff.updatedFields).toHaveLength(1);
      expect(diff.updatedFields[0].changes).toHaveLength(2); 
      expect(diff.updatedFields[0].changes).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ property: 'label', before: 'Old Label', after: 'New Label' }),
            expect.objectContaining({ property: 'required', before: false, after: true }),
        ])
      );
    });

    it('should detect logic rule changes', () => {
        const original = { logicRules: [] };
        const nw = {
            logicRules: [
                { id: 'rule1', name: 'Rule 1', logicType: 'and', conditions: [], actions: [] }
            ]
        };

        const diff = FormDiffHelper.calculateDiff(original, nw);
        expect(diff.logicChanges.added).toHaveLength(1);
        expect(diff.changes).toContain('logic');
    });
  });
});
