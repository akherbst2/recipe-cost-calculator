/**
 * Design: Organic Modernism with Culinary Warmth
 * - Warm earth tones and soft shadows
 * - Playfair Display for emphasis, Outfit for headings, Inter for body
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface SaveRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  defaultName?: string;
}

export default function SaveRecipeDialog({
  open,
  onOpenChange,
  onSave,
  defaultName = '',
}: SaveRecipeDialogProps) {
  const [recipeName, setRecipeName] = useState(defaultName);

  const handleSave = () => {
    if (recipeName.trim()) {
      onSave(recipeName.trim());
      setRecipeName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Save Recipe</DialogTitle>
          <DialogDescription>
            Give your recipe a name to save it for later reference.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipe-name">Recipe Name</Label>
            <Input
              id="recipe-name"
              placeholder="e.g., Grandma's Pasta, Birthday Cake"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!recipeName.trim()}>
            Save Recipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
