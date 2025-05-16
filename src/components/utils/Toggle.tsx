// filepath: e:\WorkSpace\Projects\El_Saborcito\El_saborcito_front\src\components\utils\Toggle.tsx

interface ToggleProps {
  isOn: boolean;
  handleToggle: () => void;
  label?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ isOn, handleToggle, label, id }) => {
  return (
    <div className="flex items-center">
      {label && (
        <label htmlFor={id} className="mr-3 text-sm font-medium text-negro dark:text-blanco">
          {label}
        </label>
      )}
      <button
        id={id}
        onClick={handleToggle}
        type="button"
        className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isOn ? 'bg-primary' : 'bg-secondary dark:bg-negro'
        }`}
        role="switch"
        aria-checked={isOn}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${
            isOn ? 'translate-x-5 bg-blanco' : 'translate-x-0 bg-negro dark:bg-blanco'
          }`}
        />
      </button>
    </div>
  );
};
