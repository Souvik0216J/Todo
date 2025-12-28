'use client'
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Save, Bold, Italic, Type, Palette, AlignLeft, AlignCenter, AlignRight, Underline, Loader2, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NotesPage() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/notes', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // API returns notes as an object or string
        const notesContent = typeof data.notes === 'string' 
          ? data.notes 
          : data.notes?.content || '';
        
        setNotes(notesContent);
        
        // Get lastUpdate from notes object if it exists
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
        
        // Get lastUpdate from the response
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

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Keep track of your thoughts and ideas
            {lastSaved && <span className="ml-2 text-xs">Last saved: {lastSaved}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
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
        <CardHeader>
          <CardTitle>Rich Text Editor</CardTitle>
          <CardDescription>Format your notes with various styling options</CardDescription>
        </CardHeader>
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
            dangerouslySetInnerHTML={{ __html: notes }}
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