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
import { useTranslation } from 'react-i18next';

interface SaveAsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  currentName?: string;
}

export default function SaveAsDialog({
  open,
  onOpenChange,
  onSave,
  currentName = '',
}: SaveAsDialogProps) {
  const { t } = useTranslation();
  const [recipeName, setRecipeName] = useState(currentName);

  const handleSave = () => {
    if (recipeName.trim()) {
      onSave(recipeName.trim());
      onOpenChange(false);
      setRecipeName('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRecipeName('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t('dialogs.saveAs.title')}</DialogTitle>
          <DialogDescription>
            {t('dialogs.saveAs.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipe-name">{t('dialogs.saveAs.recipeName')}</Label>
            <Input
              id="recipe-name"
              placeholder={t('dialogs.saveAs.placeholder')}
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
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            {t('dialogs.saveAs.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!recipeName.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {t('dialogs.saveAs.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
