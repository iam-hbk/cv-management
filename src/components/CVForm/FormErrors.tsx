"use client";

import { FieldErrors } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type ErrorWithMessage = {
  message?: string;
  type?: string;
  ref?: unknown;
  types?: Record<string, unknown>;
  [key: string]: unknown;
};

export default function FormErrors({ errors }: { errors: FieldErrors }) {
  const renderErrors = (error: ErrorWithMessage, path: string = ''): JSX.Element[] => {
    const elements: JSX.Element[] = [];

    if (error.message && typeof error.message === 'string') {
      elements.push(
        <Alert variant="destructive" key={path}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {path ? `${path}: ${error.message}` : error.message}
          </AlertDescription>
        </Alert>
      );
    }

    // Recursively handle nested errors
    Object.entries(error).forEach(([key, value]) => {
      if (
        typeof value === 'object' && 
        value !== null && 
        key !== 'ref' && 
        key !== 'types'
      ) {
        const newPath = path ? `${path}.${key}` : key;
        const formattedPath = newPath
          .split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1'))
          .join(' › ');
        
        elements.push(...renderErrors(value as ErrorWithMessage, formattedPath));
      }
    });

    return elements;
  };

  return (
    <div className="space-y-2">
      {renderErrors(errors)}
    </div>
  );
}
