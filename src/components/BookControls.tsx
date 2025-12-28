"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Settings,
    Download,
    Upload,
    Trash2,
    FileJson,
    Volume2,
    VolumeX,
    Lock,
    Unlock,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { exportDiary, importDiary, clearDiary, getLockCode, setLockCode } from "@/lib/diary";
import { useToast } from "@/hooks/use-toast";

interface BookControlsProps {
    onDataChange?: () => void;
    isMuted?: boolean;
    onMuteToggle?: () => void;
}

export function BookControls({ onDataChange, isMuted, onMuteToggle }: BookControlsProps) {
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showLockDialog, setShowLockDialog] = useState(false);
    const [lockInput, setLockInput] = useState("");
    const [currentLock, setCurrentLock] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        setCurrentLock(getLockCode());
    }, []);

    const handleExport = () => {
        try {
            const data = exportDiary();
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `my-diary-${new Date().toISOString().split("T")[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: "Your diary has been exported.",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Could not export your diary.",
                variant: "destructive",
            });
        }
    };

    const handleImportClick = () => {
        setShowImportDialog(true);
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result as string;
                const success = importDiary(data);

                if (success) {
                    toast({
                        title: "Import Successful",
                        description: "Your diary has been imported.",
                    });
                    setShowImportDialog(false);
                    onDataChange?.();
                } else {
                    toast({
                        title: "Import Failed",
                        description: "Invalid diary file format.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Import Failed",
                    description: "Could not read the file.",
                    variant: "destructive",
                });
            }
        };
        reader.readAsText(file);
    };

    const handleClear = () => {
        clearDiary();
        setShowClearDialog(false);
        toast({
            title: "Diary Cleared",
            description: "All your diary entries have been deleted.",
        });
        onDataChange?.();
    };

    const handleSaveLock = () => {
        if (lockInput.length !== 4 || isNaN(Number(lockInput))) {
            toast({
                title: "Invalid Code",
                description: "Lock code must be exactly 4 digits.",
                variant: "destructive",
            });
            return;
        }

        setLockCode(lockInput);
        setCurrentLock(lockInput);
        setShowLockDialog(false);
        toast({
            title: "Lock Secured",
            description: "Your diary is now protected with the new code.",
        });
        onDataChange?.();
    };

    const handleRemoveLock = () => {
        setLockCode(null);
        setCurrentLock(null);
        toast({
            title: "Lock Removed",
            description: "Privacy lock has been disabled.",
        });
        onDataChange?.();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-accent/20"
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Diary
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportClick}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Diary
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onMuteToggle}>
                        {isMuted ? (
                            <>
                                <Volume2 className="h-4 w-4 mr-2" />
                                Unmute Sounds
                            </>
                        ) : (
                            <>
                                <VolumeX className="h-4 w-4 mr-2" />
                                Mute Sounds
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setLockInput(currentLock || ""); setShowLockDialog(true); }}>
                        {currentLock ? (
                            <>
                                <Lock className="h-4 w-4 mr-2" />
                                Change Lock Code
                            </>
                        ) : (
                            <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Set Privacy Lock
                            </>
                        )}
                    </DropdownMenuItem>
                    {currentLock && (
                        <DropdownMenuItem onClick={handleRemoveLock} className="text-muted-foreground">
                            Remove Lock
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowClearDialog(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Confirmation Dialog */}
            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear Diary?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete all your diary entries. This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowClearDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleClear}>
                            Clear All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Diary</DialogTitle>
                        <DialogDescription>
                            Select a diary JSON file to import. This will replace your
                            current diary.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="diary-file">Diary File</Label>
                        <Input
                            ref={fileInputRef}
                            id="diary-file"
                            type="file"
                            accept=".json"
                            onChange={handleImportFile}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowImportDialog(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lock Management Dialog */}
            <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{currentLock ? "Update Lock Code" : "Initialize Lock Mechanism"}</DialogTitle>
                        <DialogDescription>
                            Enter a 4-digit numeric sequence to secure your diary.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="lock-code">New 4-Digit Combination</Label>
                            <Input
                                id="lock-code"
                                type="text"
                                maxLength={4}
                                placeholder="e.g. 1234"
                                value={lockInput}
                                onChange={(e) => setLockInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="font-mono text-center text-2xl tracking-[0.5em] h-14"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLockDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveLock} className="bg-amber-600 hover:bg-amber-700 text-white">
                            Apply Secrecy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
