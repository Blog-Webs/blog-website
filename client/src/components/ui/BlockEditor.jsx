import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Custom BlockNote theme mapped directly to our CSS variable palette, so
// the editor matches the dark/light site theme exactly instead of using
// BlockNote's generic defaults.
const darkTheme = {
  colors: {
    editor: { text: '#E8EAED', background: 'transparent' },
    menu: { text: '#E8EAED', background: '#1A1F2B' },
    tooltip: { text: '#E8EAED', background: '#20273A' },
    hovered: { text: '#E8EAED', background: '#20273A' },
    selected: { text: '#0B0E14', background: '#5EEAD4' },
    disabled: { text: '#8B93A7', background: '#1A1F2B' },
    shadow: 'rgba(0, 0, 0, 0.4)',
    border: '#2A3142',
    sideMenu: '#8B93A7',
    highlights: {
      gray: { text: '#8B93A7', background: 'rgba(139,147,167,0.15)' },
      blue: { text: '#5EEAD4', background: 'rgba(94,234,212,0.15)' },
      orange: { text: '#FFB454', background: 'rgba(255,180,84,0.15)' },
      red: { text: '#F87171', background: 'rgba(248,113,113,0.15)' },
    },
  },
  borderRadius: 10,
  fontFamily: 'Inter, system-ui, sans-serif',
};

const lightTheme = {
  colors: {
    editor: { text: '#16181D', background: 'transparent' },
    menu: { text: '#16181D', background: '#FFFFFF' },
    tooltip: { text: '#16181D', background: '#FAFAF8' },
    hovered: { text: '#16181D', background: '#FAFAF8' },
    selected: { text: '#FFFFFF', background: '#0D9488' },
    disabled: { text: '#5B6373', background: '#FAFAF8' },
    shadow: 'rgba(15, 23, 42, 0.08)',
    border: '#E2E4E9',
    sideMenu: '#5B6373',
    highlights: {
      gray: { text: '#5B6373', background: 'rgba(91,99,115,0.1)' },
      blue: { text: '#0D9488', background: 'rgba(13,148,136,0.1)' },
      orange: { text: '#C2750C', background: 'rgba(194,117,12,0.1)' },
      red: { text: '#DC2626', background: 'rgba(220,38,38,0.1)' },
    },
  },
  borderRadius: 10,
  fontFamily: 'Inter, system-ui, sans-serif',
};

// Pulls heading blocks (H1-H3) out of the BlockNote document so the page
// can build an "On This Page" navigation list and scroll-spy against it.
// Each heading's BlockNote block id is reused as the DOM anchor id, so
// reader-side scroll-spy and admin-side extraction always agree on ids.
export const extractHeadings = (blocks) => {
  const headings = [];
  const walk = (blockList) => {
    for (const block of blockList) {
      if (block.type === 'heading' && block.props?.level <= 3) {
        const text = (block.content || [])
          .map((c) => (c.type === 'text' ? c.text : ''))
          .join('')
          .trim();
        if (text) headings.push({ id: block.id, text, level: block.props.level });
      }
      if (block.children?.length) walk(block.children);
    }
  };
  walk(blocks);
  return headings;
};

// Derives a plain-text/markdown version of the document for the legacy
// `content` field — used for search indexing, excerpts, and as a fallback
// for any client that renders before block content is available. Wrapped
// defensively since this runs on every keystroke and a thrown error here
// must never break typing.
const safeBlocksToMarkdown = (editor, blocks) => {
  try {
    return editor.blocksToMarkdownLossy(blocks);
  } catch {
    return '';
  }
};

/**
 * Props:
 *  - initialContent: BlockNote block array, or undefined/null for empty
 *  - editorKey: remount key — pass something that changes once async
 *    content finishes loading (e.g. the chapter/blog id, or a loaded
 *    flag), so the editor picks up real content instead of staying
 *    stuck with whatever was available on first render. BlockNote only
 *    reads `initialContent` once, at creation time.
 *  - onChange({ blocks, headings, plainText }): fired on every edit
 *  - onUploadImage(file): async (file) => url, used for image blocks
 *  - minHeight: CSS height for the editor area (default large, per request)
 */
const BlockEditor = ({ initialContent, onChange, onUploadImage, editorKey, minHeight = '480px' }) => {
  const { theme } = useTheme();
  const initializedRef = useRef(false);

  const editor = useCreateBlockNote(
    {
      initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
      uploadFile: onUploadImage
        ? async (file) => {
            const url = await onUploadImage(file);
            return url;
          }
        : undefined,
    },
    [editorKey]
  );

  // Fire once per editor instance so a freshly-loaded existing post
  // immediately reports its headings (e.g. when opening the editor on an
  // existing chapter/blog), not just after the next keystroke. Resets
  // whenever the editor itself remounts (new editorKey).
  useEffect(() => {
    initializedRef.current = false;
  }, [editorKey]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (!onChange) return;
    const blocks = editor.document;
    const headings = extractHeadings(blocks);
    const plainText = safeBlocksToMarkdown(editor, blocks);
    onChange({ blocks, headings, plainText });
  }, [editor, onChange]);

  const handleChange = () => {
    if (!onChange) return;
    const blocks = editor.document;
    const headings = extractHeadings(blocks);
    const plainText = safeBlocksToMarkdown(editor, blocks);
    onChange({ blocks, headings, plainText });
  };

  return (
    <div
      className="rounded-xl border overflow-hidden bn-editor-wrapper"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', minHeight }}
    >
      <BlockNoteView
        editor={editor}
        theme={{ light: lightTheme, dark: darkTheme }}
        onChange={handleChange}
        style={{ minHeight }}
      />
    </div>
  );
};

export default BlockEditor;
