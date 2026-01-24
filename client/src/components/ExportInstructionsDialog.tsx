import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, FileSpreadsheet } from 'lucide-react';

interface ExportInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
}

export default function ExportInstructionsDialog({
  open,
  onOpenChange,
  fileName,
}: ExportInstructionsDialogProps) {
  const handleOpenSheets = () => {
    window.open('https://docs.google.com/spreadsheets/create', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Export Successful!
          </DialogTitle>
          <DialogDescription>
            Your recipe has been exported as a CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">File Downloaded</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">
                    {fileName}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">To import to Google Sheets:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Click the button below to open Google Sheets</li>
              <li>
                Click <span className="font-semibold">File → Import</span>
              </li>
              <li>
                Click <span className="font-semibold">Upload</span> tab
              </li>
              <li>Select the downloaded CSV file</li>
              <li>
                Choose <span className="font-semibold">Import location: Replace spreadsheet</span>
              </li>
              <li>
                Click <span className="font-semibold">Import data</span>
              </li>
            </ol>
          </div>

          <Button onClick={handleOpenSheets} className="w-full" size="lg">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Open Google Sheets
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
