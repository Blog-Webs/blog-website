import { useEffect, useRef, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { contentApi } from '../../learn/api/content';
import { adminApi } from '../api/admin';
import { blogApi } from '../../blog/api/blog';
import { extractHeadings } from '../../core/components/ui/BlockEditor';

/**
 * One-time migration: converts every chapter/blog that still has only
 * legacy Markdown content (contentBlocks is null) into real BlockNote
 * JSON blocks, using the editor's own `tryParseMarkdownToBlocks`.
 *
 * This has to run in a real browser (not a Node script) because BlockNote
 * is built on ProseMirror, which needs a DOM to operate correctly — so
 * this page mounts one (invisible) editor instance and reuses it to
 * convert every piece of content in sequence, saving each result back
 * through the normal authenticated admin API as it goes.
 *
 * Safe to run more than once: anything that already has contentBlocks is
 * skipped, so re-running just catches anything created since the last run.
 */
const MigrationTool = () => {
  const [status, setStatus] = useState('idle'); // idle | scanning | running | done | error
  const [log, setLog] = useState([]);
  const [toMigrate, setToMigrate] = useState({ chapters: [], blogs: [] });
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const editorRef = useRef(null);

  // A single hidden editor instance, reused for every conversion — we
  // never render its UI, only call its conversion method directly.
  const editor = useCreateBlockNote({});
  editorRef.current = editor;

  const appendLog = (line) => setLog((prev) => [...prev, line]);

  const scan = async () => {
    setStatus('scanning');
    setLog([]);
    appendLog('Scanning subjects → topics → tracks → chapters…');

    const chaptersNeedingMigration = [];
    try {
      const { data: subjectsData } = await contentApi.getSubjects();
      for (const subject of subjectsData.subjects) {
        const { data: subjectDetail } = await contentApi.getSubjectBySlug(subject.slug);
        for (const topic of subjectDetail.topics) {
          const { data: tracksData } = await contentApi.getTracksForTopic(topic._id);
          for (const track of tracksData.tracks) {
            const { data: chaptersData } = await contentApi.getChaptersForTrack(track._id);
            for (const chapterStub of chaptersData.chapters) {
              try {
                // The list endpoint excludes contentBlocks/content, so fetch
                // the full chapter to actually check if it needs migrating.
                const { data: full } = await contentApi.getChapterContent(chapterStub._id);
                if (!full.locked && !full.chapter.contentBlocks) {
                  chaptersNeedingMigration.push(full.chapter);
                }
              } catch (err) {
                // One bad chapter shouldn't abort the whole scan — log it
                // and keep going, so the admin can see exactly what to
                // check by hand afterward.
                appendLog(`✗ Could not read chapter "${chapterStub.title}": ${err.message}`);
              }
            }
          }
        }
      }
    } catch (err) {
      appendLog(`✗ Scan failed while listing subjects/topics/tracks: ${err.message}`);
      setStatus('idle');
      return;
    }
    appendLog(`Found ${chaptersNeedingMigration.length} chapters needing migration.`);

    appendLog('Scanning blog posts…');
    let blogsNeedingMigration = [];
    try {
      const { data: blogsData } = await blogApi.getAllAdmin({ limit: 500 });
      if (blogsData.total > blogsData.blogs.length) {
        appendLog(
          `⚠ There are ${blogsData.total} total posts but this scan only fetched ${blogsData.blogs.length}. ` +
          'Re-run the migration after this batch finishes to catch the rest.'
        );
      }
      blogsNeedingMigration = blogsData.blogs.filter((b) => !b.contentBlocks);
      appendLog(`Found ${blogsNeedingMigration.length} blog posts needing migration.`);
    } catch (err) {
      appendLog(`✗ Could not list blog posts: ${err.message}`);
    }

    setToMigrate({ chapters: chaptersNeedingMigration, blogs: blogsNeedingMigration });
    setStatus(chaptersNeedingMigration.length + blogsNeedingMigration.length > 0 ? 'ready' : 'done');
  };

  const runMigration = async () => {
    setStatus('running');
    const total = toMigrate.chapters.length + toMigrate.blogs.length;
    setProgress({ done: 0, total });
    let done = 0;
    let noHeadingsCount = 0;
    let failedCount = 0;

    for (const chapter of toMigrate.chapters) {
      try {
        const blocks = editorRef.current.tryParseMarkdownToBlocks(chapter.content || '');
        const headings = extractHeadings(blocks);
        await adminApi.updateChapter(chapter._id, { contentBlocks: blocks, headings });
        const note = headings.length === 0 ? ' (no headings — "On this page" will be empty until you add some)' : '';
        if (headings.length === 0) noHeadingsCount += 1;
        appendLog(`✓ Chapter: ${chapter.title}${note}`);
      } catch (err) {
        failedCount += 1;
        appendLog(`✗ Chapter "${chapter.title}" failed: ${err.message}`);
      }
      done += 1;
      setProgress({ done, total });
    }

    for (const blog of toMigrate.blogs) {
      try {
        // Admin list view doesn't include full content, fetch it first.
        const { data } = await blogApi.getByIdAdmin(blog._id);
        const blocks = editorRef.current.tryParseMarkdownToBlocks(data.blog.content || '');
        const headings = extractHeadings(blocks);
        await blogApi.update(blog._id, { contentBlocks: blocks, headings });
        const note = headings.length === 0 ? ' (no headings — "On this page" will be empty until you add some)' : '';
        if (headings.length === 0) noHeadingsCount += 1;
        appendLog(`✓ Blog: ${blog.title}${note}`);
      } catch (err) {
        failedCount += 1;
        appendLog(`✗ Blog "${blog.title}" failed: ${err.message}`);
      }
      done += 1;
      setProgress({ done, total });
    }

    appendLog('───────────────────────────────');
    appendLog(`Done. ${total - failedCount} succeeded, ${failedCount} failed.`);
    if (noHeadingsCount > 0) {
      appendLog(
        `${noHeadingsCount} item(s) had no Markdown headings, so their "On this page" rail will be ` +
        'empty until you open them in the editor and add some heading blocks.'
      );
    }

    setStatus('done');
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Content Migration Tool</h1>
      <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
        One-time tool to convert older Markdown chapters/posts into the new rich-text block format.
        Safe to run multiple times — anything already migrated is skipped automatically.
      </p>

      <div className="p-4 rounded-xl border mb-6 flex items-start gap-3" style={{ borderColor: 'var(--amber)', backgroundColor: 'var(--amber-soft)' }}>
        <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--amber)' }} />
        <p className="text-sm" style={{ color: 'var(--text)' }}>
          This writes directly to your live database. It's non-destructive — the legacy Markdown stays
          in place as a fallback — but it's still a good idea to make sure you're not mid-edit on
          anything else while it runs.
        </p>
      </div>

      {status === 'idle' && (
        <button
          onClick={scan}
          className="px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
        >
          Scan for content to migrate
        </button>
      )}

      {status === 'scanning' && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={16} className="animate-spin" /> Scanning…
        </div>
      )}

      {status === 'ready' && (
        <div>
          <p className="text-sm mb-4">
            Ready to migrate <strong>{toMigrate.chapters.length}</strong> chapters and{' '}
            <strong>{toMigrate.blogs.length}</strong> blog posts.
          </p>
          <button
            onClick={runMigration}
            className="px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
          >
            Run migration now
          </button>
        </div>
      )}

      {status === 'running' && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="animate-spin" />
            Migrating… {progress.done} / {progress.total}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-full transition-[width] duration-200"
              style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%`, backgroundColor: 'var(--accent)' }}
            />
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--accent)' }}>
          <CheckCircle2 size={16} /> Migration complete.
        </div>
      )}

      {log.length > 0 && (
        <div
          className="mt-6 p-4 rounded-xl border font-mono-display text-xs max-h-80 overflow-y-auto flex flex-col gap-1"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          {log.map((line, i) => (
            <p key={i} style={{ color: line.startsWith('✗') ? 'var(--danger)' : 'var(--text-muted)' }}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default MigrationTool;
