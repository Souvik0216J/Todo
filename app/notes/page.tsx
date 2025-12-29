'use client'
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Save, Bold, Italic, Type, Palette, AlignLeft, AlignCenter, AlignRight, Underline, Loader2, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function NotesPage() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
  }, []);

  // Set initial content only once
  useEffect(() => {
    if (!loading && editorRef.current && notes && !isInitialized) {
      editorRef.current.innerHTML = notes;
      setIsInitialized(true);
    }
  }, [notes, loading, isInitialized]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/notes', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        const notesContent = typeof data.notes === 'string'
          ? data.notes
          : data.notes?.content || '';

        setNotes(notesContent);

        if (data.notes?.lastUpdate) {
          setLastSaved(data.notes.lastUpdate);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const content = editorRef.current?.innerHTML || '';

      const response = await fetch('/api/users/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          notes: content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Notes saved successfully');
        setNotes(content);
        setHasUnsavedChanges(false);
        setIsInitialized(true);

        if (data.notes?.lastUpdate) {
          setLastSaved(data.notes.lastUpdate);
        }
      } else {
        toast.error(data.error || 'Failed to save notes');
      }
    } catch (err: any) {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const handleDashboardClick = () => {
    const currentContent = editorRef.current?.innerHTML || '';
    if (currentContent !== notes) {
      setShowUnsavedDialog(true);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSaveAndNavigate = async () => {
    await handleSave();
    router.push('/dashboard');
  };

  const handleDiscardAndNavigate = () => {
    setShowUnsavedDialog(false);
    router.push('/dashboard');
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      setHasUnsavedChanges(currentContent !== notes);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Trigger change detection after command execution
    handleEditorChange();
  };

  const fontSizes = [
    { label: 'Small', value: '1' },
    { label: 'Normal', value: '3' },
    { label: 'Large', value: '5' },
    { label: 'Huge', value: '7' },
  ];

  const textColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Blue', value: '#0000ff' },
    { name: 'Green', value: '#008000' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#ff6600' },
  ];

  const highlightColors = [
    { name: 'Yellow', value: '#ffff00' },
    { name: 'Green', value: '#90ee90' },
    { name: 'Blue', value: '#add8e6' },
    { name: 'Pink', value: '#ffb6c1' },
    { name: 'Orange', value: '#ffd700' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      {/* Hidden color inputs */}
      <input
        ref={colorInputRef}
        type="color"
        className="hidden"
        onChange={(e) => execCommand('foreColor', e.target.value)}
      />
      <input
        ref={bgColorInputRef}
        type="color"
        className="hidden"
        onChange={(e) => execCommand('backColor', e.target.value)}
      />

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your notes. Do you want to save them before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardAndNavigate}>
              Discard Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndNavigate}>
              Save & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Keep track of your thoughts and ideas
            {lastSaved && <span className="ml-2 text-xs">Last saved: {lastSaved}</span>}
            {hasUnsavedChanges && <span className="ml-2 text-xs text-orange-500">• Unsaved changes</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDashboardClick}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Notes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Card */}
      <Card>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg border">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('bold')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('italic')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('underline')}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-border" />

            {/* Font Size Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" title="Font Size">
                  <Type className="h-4 w-4 mr-1" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {fontSizes.map((size) => (
                  <DropdownMenuItem
                    key={size.value}
                    onClick={() => execCommand('fontSize', size.value)}
                  >
                    {size.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Text Color Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" title="Text Color">
                  <Palette className="h-4 w-4 mr-1" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {textColors.map((color) => (
                  <DropdownMenuItem
                    key={color.value}
                    onClick={() => execCommand('foreColor', color.value)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => colorInputRef.current?.click()}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border bg-linear-to-r from-red-500 via-yellow-500 to-blue-500" />
                    Custom...
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Highlight Color Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" title="Highlight Color">
                  <Palette className="h-4 w-4 mr-1 fill-yellow-400" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {highlightColors.map((color) => (
                  <DropdownMenuItem
                    key={color.value}
                    onClick={() => execCommand('backColor', color.value)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => bgColorInputRef.current?.click()}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border bg-linear-to-r from-red-500 via-yellow-500 to-blue-500" />
                    Custom...
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-8 bg-border" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('justifyLeft')}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('justifyCenter')}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('justifyRight')}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[500px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            onInput={handleEditorChange}
            onKeyUp={handleEditorChange}
            onPaste={handleEditorChange}
            onCut={handleEditorChange}
            onBlur={handleEditorChange}
            suppressContentEditableWarning
            style={{ maxHeight: '600px', overflowY: 'auto' }}
          />

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground">
            Tip: Select text and use the toolbar buttons to format. Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}