
import React from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, CornerDownRight, ChevronsRight, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';
import { TocItem, TocItemType } from '../types';

// --- Sortable Item Component ---
interface SortableItemProps {
  item: TocItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newTitle: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, onDelete, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isSubchapter = item.type === 'subchapter';
  const isInternalSubchapter = item.type === 'internal-subchapter';
  const isRecap = item.type === 'recap';

  let marginLeft = '';
  if (isSubchapter) marginLeft = 'ml-8 md:ml-12';
  if (isInternalSubchapter) marginLeft = 'ml-16 md:ml-24';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group flex items-center gap-3 mb-3 ${marginLeft}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
      >
        <GripVertical size={20} />
      </div>

      <div className={`flex-1 flex items-center gap-3 bg-white border ${isDragging ? 'border-primary shadow-lg' : 'border-slate-200'} rounded-lg p-3 transition-all duration-200`}>
        {isSubchapter && (
            <CornerDownRight size={16} className="text-slate-300 shrink-0" />
        )}
        {isInternalSubchapter && (
            <ChevronsRight size={16} className="text-slate-300 shrink-0" />
        )}
        {isRecap && (
            <RotateCcw size={16} className="text-slate-400 shrink-0" />
        )}
        
        <input 
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
            value={item.title}
            onChange={(e) => onUpdate(item.id, e.target.value)}
            placeholder={
                isRecap ? "Título do Recapitulando" :
                isInternalSubchapter ? "Subtítulo Interno" :
                isSubchapter ? "Subtítulo" : 
                "Título do Capítulo"
            }
        />
        
        <button 
            onClick={() => onDelete(item.id)}
            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Excluir item"
        >
            <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// --- Main Builder Component ---

interface SummaryBuilderProps {
  items: TocItem[];
  setItems: React.Dispatch<React.SetStateAction<TocItem[]>>;
}

export const SummaryBuilder: React.FC<SummaryBuilderProps> = ({ items, setItems }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addItem = (type: TocItemType) => {
    const newItem: TocItem = {
      id: `item-${Date.now()}`,
      title: '',
      type,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, newTitle: string) => {
    setItems(items.map(item => item.id === id ? { ...item, title: newTitle } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button onClick={() => addItem('chapter')} className="w-full gap-2 justify-start pl-4">
          <Plus size={18} /> Adicionar Título
        </Button>
        <Button onClick={() => addItem('recap')} variant="secondary" className="w-full gap-2 justify-start pl-4 bg-slate-100 hover:bg-slate-200">
          <RotateCcw size={18} /> Recapitulando
        </Button>
        <Button onClick={() => addItem('subchapter')} variant="outline" className="w-full gap-2 justify-start pl-4 border-dashed">
          <CornerDownRight size={18} /> Adicionar Subtítulo
        </Button>
        <Button onClick={() => addItem('internal-subchapter')} variant="outline" className="w-full gap-2 justify-start pl-8 border-dashed">
          <ChevronsRight size={18} /> Subtítulo Interno
        </Button>
      </div>

      <div className="bg-slate-50/50 rounded-xl p-2 sm:p-4 min-h-[200px] border-2 border-dashed border-slate-200">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
             <p>Seu sumário está vazio.</p>
             <p className="text-sm">Adicione títulos acima para começar.</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map(i => i.id)} 
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableItem 
                  key={item.id} 
                  item={item} 
                  onDelete={deleteItem}
                  onUpdate={updateItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
