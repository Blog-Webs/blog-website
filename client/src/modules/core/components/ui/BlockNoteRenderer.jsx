import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useTheme } from '../../context/ThemeContext';

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

const EMPTY_DOC = [{ type: 'paragraph', content: '' }];

/**
 * Renders a BlockNote document read-only, for published chapters and blog
 * posts. Each top-level block renders with a `data-id` DOM attribute equal
 * to its BlockNote block id — the same id used in `headings` — which is
 * what lets the "On This Page" rail scroll-spy work without any custom
 * heading-anchor plumbing.
 *
 * Falls back to rendering nothing extra if `blocks` is empty/null — callers
 * should show their own legacy-Markdown fallback in that case (older
 * content created before the BlockNote migration).
 */
const BlockNoteRenderer = ({ blocks }) => {
  const { theme } = useTheme();

  const editor = useCreateBlockNote(
    { initialContent: blocks && blocks.length > 0 ? blocks : EMPTY_DOC },
    [blocks]
  );

  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="block-reader">
      <BlockNoteView editor={editor} editable={false} theme={{ light: lightTheme, dark: darkTheme }} />
    </div>
  );
};

export default BlockNoteRenderer;
