import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "←/→", description: "Navigate slides (landing)" },
  { key: "Escape", description: "Close modals" },
  { key: "?", description: "Show this help" },
];

const KeyboardShortcuts = ({ open, onClose }: KeyboardShortcutsProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.key} className="flex items-center justify-between gap-4">
            <kbd className="px-2 py-1 bg-[#a4a3d0]/20 rounded text-sm font-mono">
              {shortcut.key}
            </kbd>
            <span className="text-[rgba(44,49,80,0.7)]">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default KeyboardShortcuts;
