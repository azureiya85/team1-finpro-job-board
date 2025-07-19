import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatEnumKey } from '@/lib/utils'; 

export interface FilterGroupProps<T extends string> {
  items: Record<string, T>;
  selectedItems: T[];
  title: string;
  // This is the new prop. It's much simpler.
  onItemToggle: (itemValue: T, isChecked: boolean) => void;
}

export function FilterGroup<T extends string>({ 
  items, 
  selectedItems, 
  onItemToggle, 
  title 
}: FilterGroupProps<T>) {
  
  const handleCheckboxChange = (itemValue: T, checked: boolean | 'indeterminate') => {
    onItemToggle(itemValue, !!checked);
  };

  return (
    <ScrollArea className="h-auto max-h-60 pr-3"> 
      <div className="space-y-2 py-2">
        {Object.values(items).map((value) => (
          <div key={value} className="flex items-center space-x-2">
            <Checkbox
              id={`${title.replace(/\s+/g, '-')}-${value}`}
              checked={selectedItems.includes(value)}
              onCheckedChange={(checked) => handleCheckboxChange(value, checked)}
            />
            <Label
              htmlFor={`${title.replace(/\s+/g, '-')}-${value}`}
              className="font-normal text-sm text-foreground/80 cursor-pointer"
            >
              {formatEnumKey(value)}
            </Label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}