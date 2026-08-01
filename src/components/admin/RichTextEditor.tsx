import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import {
  Bold, Italic, UnderlineIcon, Heading1, Heading2, List, ListOrdered,
  Quote, Code, LinkIcon, ImageIcon, Youtube as YoutubeIcon, Undo, Redo
} from 'lucide-react'
import clsx from 'clsx'
import { uploadMediaFile } from '../../services/storage'
import { useAuth } from '../../contexts/AuthContext'

function ToolbarButton({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={clsx('p-2 rounded-lg transition', active ? 'bg-blue-500 text-white' : 'text-ink-soft hover:bg-paper')}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const { user } = useAuth()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Youtube.configure({ width: 480, height: 270 }),
      Placeholder.configure({ placeholder: 'Tulis isi artikel di sini…' })
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  })

  if (!editor) return null

  async function insertImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file || !user) return
      try {
        const url = await uploadMediaFile(file, 'articles')
        editor?.chain().focus().setImage({ src: url }).run()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
      }
    }
    input.click()
  }

  function insertLink() {
    const url = window.prompt('URL tautan:')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  function insertYoutube() {
    const url = window.prompt('URL video YouTube:')
    if (url) editor?.commands.setYoutubeVideo({ src: url })
  }

  return (
    <div className="border border-line rounded-xl2 overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-paper px-2 py-1.5">
        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></ToolbarButton>
        <span className="w-px h-5 bg-line mx-1" />
        <ToolbarButton title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={16} /></ToolbarButton>
        <ToolbarButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></ToolbarButton>
        <span className="w-px h-5 bg-line mx-1" />
        <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></ToolbarButton>
        <ToolbarButton title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code size={16} /></ToolbarButton>
        <span className="w-px h-5 bg-line mx-1" />
        <ToolbarButton title="Link" onClick={insertLink}><LinkIcon size={16} /></ToolbarButton>
        <ToolbarButton title="Upload image" onClick={insertImage}><ImageIcon size={16} /></ToolbarButton>
        <ToolbarButton title="Embed YouTube" onClick={insertYoutube}><YoutubeIcon size={16} /></ToolbarButton>
        <span className="w-px h-5 bg-line mx-1" />
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo size={16} /></ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo size={16} /></ToolbarButton>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none px-4 py-3 min-h-[240px] focus:outline-none [&_.ProseMirror]:min-h-[220px] [&_.ProseMirror]:outline-none" />
    </div>
  )
}