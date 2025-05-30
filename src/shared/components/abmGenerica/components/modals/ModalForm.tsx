import React from 'react';

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: string | number }>;
}

interface ModalFormProps<T> {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  initialValues: T;
  onSubmit: (values: T) => void;
  readonly?: boolean;
}

const ModalForm = <T extends Record<string, unknown>>({
  open,
  onClose,
  title,
  fields,
  initialValues,
  onSubmit,
  readonly = false,
}: ModalFormProps<T>) => {
  const [form, setForm] = React.useState<T>(initialValues);

  React.useEffect(() => {
    setForm(initialValues);
  }, [initialValues, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1" htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={form[field.name] as string | number}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required={field.required}
                  disabled={field.disabled || readonly}
                >
                  <option value="">Seleccione...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={form[field.name] as string | number}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required={field.required}
                  disabled={field.disabled || readonly}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              {readonly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!readonly && (
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Guardar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
