'use client';

import { useEffect, useMemo } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Pilcrow, Quote, Minus, Code, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (richText: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
}

const ToolbarButton = ({ onClick, isActive, children, title }: { onClick: () => void; isActive?: boolean; children: React.ReactNode; title: string }) => (
  <Button
    type="button"
    variant={isActive ? 'secondary' : 'ghost'}
    size="sm"
    onClick={onClick}
    title={title}
    className={cn('p-2 h-auto', { 'bg-muted text-accent-foreground': isActive })}
  >
    {children}
  </Button>
);

export default function RichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Start typing...',
  className,
  editorClassName,
}: RichTextEditorProps) {

  // Memoize extensions if they depend on props that might change
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Placeholder.configure({
      placeholder: editable ? placeholder : '',
    }),
  ], [editable, placeholder]); // Dependencies for re-creating extensions array

  const editor = useEditor({
    extensions, 
    content: content, 
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none p-4 min-h-[150px] rounded-md border border-input bg-transparent shadow-sm',
          { 'bg-muted cursor-not-allowed opacity-70': !editable },
          editorClassName
        ),
      },
    },
  }, [extensions, onChange]);


  // Effect to explicitly set editable state on the editor instance
  useEffect(() => {
    if (!editor) {
      return;
    }
    if (editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Effect to update editor content if `content` prop changes externally
  useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]); // Runs when content or editor instance changes


  // 3. Ensure Editor Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]); 

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {editable && ( // Conditionally render the toolbar
        <div className="flex flex-wrap items-center gap-1 border-b p-2 rounded-t-md bg-card">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Paragraph"
          >
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
           <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}
      <EditorContent editor={editor} />

      {editor && editable && (
         <BubbleMenu editor={editor} tippyOptions={{ duration: 100, animation: false }} 
            className="flex items-center gap-1 p-1 bg-background border rounded-md shadow-lg"
         >
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon className="h-4 w-4" /></ToolbarButton>
        </BubbleMenu>
      )}
      {editor && editable && (
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100, animation: false }}
            className="flex flex-col gap-1 p-1 bg-background border rounded-md shadow-lg"
        >
            <Button variant="ghost" size="sm" className="text-left justify-start" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Button>
            <Button variant="ghost" size="sm" className="text-left justify-start" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
            <Button variant="ghost" size="sm" className="text-left justify-start" onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet List</Button>
        </FloatingMenu>
      )}
    </div>
  );
}