import { KanbanBoard } from '../../../modules/HU17_Cocina/Components/KanbanBoard';

export const Cocina: React.FC = () => {
  return (
    <div className="bg-gray-100 w-full min-h-full p-4">
      <div className="p-0">
        <KanbanBoard />
      </div>
    </div>
  );
};
