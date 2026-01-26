"use client";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

import { useFormStore } from "@/store/formStore";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { FieldType as FormElementType, Field } from "@/types";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toaster";
import {
  BaseFieldProperties,
  HeaderProperties,
  NumberProperties,
  OptionsProperties,
  ParagraphProperties,
  RateProperties,
  TextareaProperties,
} from "./properties";

const OPTION_FIELD_TYPES: FormElementType[] = [
  FormElementType.DROPDOWN,
  FormElementType.RADIO,
  FormElementType.CHECKBOX,
];

export default function PropertiesPanel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { selectedFieldId, currentForm, updateField, deleteField, duplicateField } =
    useFormStore();
  const elements = currentForm?.fields || [];

  const selectedElement = elements.find((el: Field) => el.id === selectedFieldId);

  if (!selectedElement) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground text-center py-8">
          {t('builder.properties.select_element', 'Select an element to edit its properties')}
        </p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<typeof selectedElement>) => {
    updateField(selectedElement.id, updates);
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
      deleteField(selectedElement.id);
      toast({
        title: t('builder.toast.element_deleted'),
        description: t('builder.toast.element_deleted_desc'),
        variant: "default",
      });
  };

  const handleDuplicate = () => {
    duplicateField(selectedElement.id);
    toast({
      title: t('builder.toast.element_duplicated'),
      description: t('builder.toast.element_duplicated_desc'),
      variant: "default",
    });
  };

  const isBaseFieldType =
    selectedElement.type !== FormElementType.HEADER &&
    selectedElement.type !== FormElementType.PARAGRAPH;

  const needsOptions = OPTION_FIELD_TYPES.includes(selectedElement.type);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">{t('builder.properties.element_properties', 'Element Properties')}</h2>
        <div className="flex gap-1">
          <Tooltip content={t('builder.properties.tooltip_duplicate', 'Duplicate (Ctrl+D)')}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('builder.properties.tooltip_delete', 'Delete (Delete key)')}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {isBaseFieldType && (
        <BaseFieldProperties element={selectedElement} onUpdate={handleUpdate} />
      )}

      {selectedElement.type === FormElementType.PARAGRAPH && (
        <ParagraphProperties element={selectedElement} onUpdate={handleUpdate} />
      )}

      {selectedElement.type === FormElementType.HEADER && (
        <HeaderProperties element={selectedElement} onUpdate={handleUpdate} />
      )}

      {selectedElement.type === FormElementType.TEXTAREA && (
        <TextareaProperties element={selectedElement} onUpdate={handleUpdate} />
      )}

      {selectedElement.type === FormElementType.NUMBER && (
        <NumberProperties element={selectedElement} onUpdate={handleUpdate} />
      )}

      {selectedElement.type === FormElementType.RATE && (
        <RateProperties element={selectedElement} onUpdate={handleUpdate} />
      )}

      {needsOptions && (
        <OptionsProperties element={selectedElement} onUpdate={handleUpdate} />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('builder.element.delete_confirm')}
        description={t('builder.element.delete_confirm_desc')}
        onConfirm={confirmDelete}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        variant="destructive"
      />
    </div>
  );
}
