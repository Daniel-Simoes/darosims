import { useEffect, useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createEditTrackingExtensions } from '../../../lib/editTrackingExtension';
import './DocumentEditor.css';

interface DocumentEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  trackEdits?: boolean;
  variant?: 'default' | 'fullscreen';
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`doc-editor-toolbar-btn ${active ? 'active' : ''}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function DocumentEditor({
  content,
  onChange,
  placeholder = 'Start writing your document...',
  disabled = false,
  trackEdits = false,
  variant = 'default',
}: DocumentEditorProps) {
  const editTrackingExtensions = useMemo(
    () => (trackEdits ? createEditTrackingExtensions() : []),
    [trackEdits],
  );

  const editor = useEditor({
    extensions: [StarterKit, ...editTrackingExtensions],
    content,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `doc-editor-content ${variant === 'fullscreen' ? 'doc-editor-content-fullscreen' : ''}`,
        'data-placeholder': placeholder,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || '<p></p>', { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return <div className="doc-editor-loading">Loading editor...</div>;
  }

  return (
    <div className={`doc-editor ${variant === 'fullscreen' ? 'doc-editor-fullscreen' : ''} ${disabled ? 'disabled' : ''}`}>
      <div className="doc-editor-toolbar">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="H1"
          active={editor.isActive('heading', { level: 1 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="H2"
          active={editor.isActive('heading', { level: 2 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Bullets"
          active={editor.isActive('bulletList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered"
          active={editor.isActive('orderedList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Undo"
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />
        {trackEdits ? (
          <span className="doc-editor-track-hint">Edits highlighted in yellow</span>
        ) : null}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
