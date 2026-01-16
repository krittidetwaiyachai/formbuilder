"use client";

import { MOCK_FORM_ELEMENTS } from "@/lib/mock-data";
import { FieldType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card"; // Added back Card and CardContent
import { Star } from "lucide-react"; // Added back Star

export default function FormPreview() {
  const renderElement = (element: any) => {
    switch (element.type) {
      case FieldType.HEADER:
        return (
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {element.content}
          </h2>
        );

      case FieldType.PARAGRAPH:
        return (
          <p className="text-muted-foreground mb-2">{element.content}</p>
        );

      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.NUMBER:
        return (
          <div className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={element.id}
              type={element.type === FieldType.EMAIL ? "email" : element.type === FieldType.NUMBER ? "number" : "text"}
              placeholder={element.placeholder}
            />
            {element.helperText && (
              <p className="text-sm text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case FieldType.TEXTAREA:
        return (
          <div className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Textarea
              id={element.id}
              placeholder={element.placeholder}
              rows={element.rows || 4}
            />
            {element.helperText && (
              <p className="text-sm text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case FieldType.DROPDOWN:
        return (
          <div className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select>
              <SelectTrigger id={element.id}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {element.options?.map((opt: any) => (
                  <SelectItem key={opt.id} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {element.helperText && (
              <p className="text-sm text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case FieldType.CHECKBOX:
        return (
          <div className="space-y-3">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="space-y-2">
              {element.options?.map((opt: any) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <Checkbox id={opt.id} />
                  <Label
                    htmlFor={opt.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
            {element.helperText && (
              <p className="text-sm text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case FieldType.RADIO:
        return (
          <div className="space-y-3">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <RadioGroup name={element.id}>
              {element.options?.map((opt: any) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={opt.id} />
                  <Label
                    htmlFor={opt.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {element.helperText && (
              <p className="text-sm text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case FieldType.DATE:
        return (
          <div className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input id={element.id} type="date" />
            {element.helperText && (
              <p className="text-sm text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case FieldType.FILE:
        return (
          <div className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input id={element.id} type="file" accept={element.accept} />
            {element.helperText && (
              <p className="text-sm text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case FieldType.RATE:
        return (
          <div className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="flex gap-1">
              {Array.from({ length: element.max || 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="h-8 w-8 p-0 hover:opacity-80 transition-opacity"
                >
                  <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                </button>
              ))}
            </div>
            {element.helperText && (
              <p className="text-sm text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

        default:
          return null;
      }
    };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardContent className="p-8">
        <form className="space-y-6">
          {MOCK_FORM_ELEMENTS.map((element) => (
            <div key={element.id}>{renderElement(element)}</div>
          ))}
          <div className="pt-4">
            <Button type="submit" className="w-full" size="lg">
              Submit Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

