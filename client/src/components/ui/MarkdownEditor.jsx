import { useRef, useState } from 'react';
import { Bold, Italic, Link2, Quote, Minus, Code2, Image as ImageIcon, Heading2 } from 'lucide-react';

// Wraps or inserts markdown syntax around the current selection in a textarea,
// then restores focus and a sensible cursor position.
const applyWrap = (textarea, before, after = before, placeholder = '') => {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const newValue = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  const cursorStart = selectionStart + before.length;
  const cursorEnd = cursorStart + selected.length;
  return { newValue, cursorStart, cursorEnd };
};

const applyLinePrefix = (textarea, prefix) => {
  const { selectionStart, value } = textarea;
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  return { newValue, cursorStart: selectionStart + prefix.length, cursorEnd: selectionStart + prefix.length };
};

const applyInsertBlock = (textarea, block) => {
  const { selectionStart, value } = textarea;
  const needsLeadingNewline = selectionStart > 0 && value[selectionStart - 1] !== '\n';
  const insert = (needsLeadingNewline ? '\n' : '') + block + '\n';
  const newValue = value.slice(0, selectionStart) + insert + value.slice(selectionStart);
  const cursorPos = selectionStart + insert.length;
  return { newValue, cursorStart: cursorPos, cursorEnd: cursorPos };
};

/**
 * MarkdownToolbar + textarea, packaged together so cursor-relative
 * formatting actions always operate on the right <textarea>.
 *
 * Props:
 *  - value, onChange(string)
 *  - onUploadImage(file) => Promise<url>   (optional — omits image button if absent)
 *  - rows, placeholder, className
 */
const MarkdownEditor = ({ value, onChange, onUploadImage, rows = 14, placeholder, className = '' }) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const runTransform = (transformFn) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { newValue, cursorStart, cursorEnd } = transformFn(textarea);
    onChange(newValue);
    // Restore selection/cursor after React re-renders the textarea value
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const handleBold = () => runTransform((ta) => applyWrap(ta, '**', '**', 'bold text'));
  const handleItalic = () => runTransform((ta) => applyWrap(ta, '_', '_', 'italic text'));
  const handleCode = () => runTransform((ta) => applyWrap(ta, '```\n', '\n```', 'code here'));
  const handleQuote = () => runTransform((ta) => applyLinePrefix(ta, '> '));
  const handleHeading = () => runTransform((ta) => applyLinePrefix(ta, '## '));
  const handleDivider = () => runTransform((ta) => applyInsertBlock(ta, '---'));

  const handleLink = () => {
    const url = window.prompt('Link URL:', 'https://');
    if (!url) return;
    runTransform((ta) => applyWrap(ta, '[', `](${url})`, 'link text'));
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      runTransform((ta) => applyInsertBlock(ta, `![image description](${url})`));
    } catch {
      alert('Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const buttons = [
    { icon: Bold, label: 'Bold', onClick: handleBold },
    { icon: Italic, label: 'Italic', onClick: handleItalic },
    { icon: Heading2, label: 'Heading', onClick: handleHeading },
    { icon: Link2, label: 'Hyperlink', onClick: handleLink },
    { icon: Quote, label: 'Quote', onClick: handleQuote },
    { icon: Minus, label: 'Divider line', onClick: handleDivider },
    { icon: Code2, label: 'Code block', onClick: handleCode },
  ];

  return (
    <div className={`rounded-2xl border overflow-hidden ${className}`} style={{ borderColor: 'var(--border)' }}>
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b flex-wrap"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)' }}
      >
        {buttons.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className="p-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon size={15} />
          </button>
        ))}
        {onUploadImage && (
          <>
            <span className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border)' }} />
            <button
              type="button"
              onClick={handleImageClick}
              disabled={uploading}
              title="Insert image"
              aria-label="Insert image"
              className="p-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors flex items-center gap-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <ImageIcon size={15} />
              {uploading && <span className="text-xs">Uploading…</span>}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageFile} />
          </>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-4 outline-none font-mono-display text-sm resize-y"
        style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
      />
    </div>
  );
};

export default MarkdownEditor;
