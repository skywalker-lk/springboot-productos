import { useState } from 'react';

// Gentleman Programming: Generic hook with proper TypeScript
export const useForm = <T extends Record<string, unknown>>(initState: T) => {
  const [form, setForm] = useState<T>(initState);

  const onChange = <K extends keyof T>(value: T[K], field: K) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const setFormValue = (newForm: Partial<T>) => {
    setForm({ ...form, ...newForm });
  };

  const resetForm = () => {
    setForm(initState);
  };

  return {
    form,
    onChange,
    setFormValue,
    resetForm,
  };
};
