import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Bold,
  Code2,
  Eye,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Search,
  Send,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import StudySidebar from '../components/layout/StudySidebar'
import { getApiErrorMessage } from '../services/api-client'
import { createPost } from '../services/posts.service'
import { getTags } from '../services/tags.service'
import type { Tag } from '../types/post'
import '../styles/post-editor.css'

const initialContent = `## Bạn đã học được gì?

Chia sẻ kiến thức, ví dụ thực tế hoặc giải pháp của bạn tại đây.

\`\`\`ts
// Code mẫu
\`\`\`
`

function CreatePostPage() {
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(initialContent)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([])
  const [tagSearch, setTagSearch] = useState('')
  const [isLoadingTags, setIsLoadingTags] = useState(true)
  const [tagErrorMessage, setTagErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadTags() {
      try {
        const tags = await getTags(controller.signal)
        setAvailableTags(tags)
      } catch (error) {
        if (!controller.signal.aborted) {
          setTagErrorMessage(getApiErrorMessage(error, 'Không thể tải danh sách tags.'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingTags(false)
        }
      }
    }

    loadTags()

    return () => controller.abort()
  }, [])

  const normalizedTagSearch = tagSearch.trim().toLocaleLowerCase()
  const filteredTags = availableTags.filter((tag) => (
    !normalizedTagSearch || tag.name.toLocaleLowerCase().includes(normalizedTagSearch)
  ))

  function toggleTag(tagName: string) {
    setSelectedTagNames((currentTags) => (
      currentTags.includes(tagName)
        ? currentTags.filter((name) => name !== tagName)
        : [...currentTags, tagName]
    ))
  }

  function insertMarkdown(prefix: string, suffix = '', placeholder = 'nội dung') {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd
    const selectedText = content.slice(selectionStart, selectionEnd) || placeholder
    const nextContent = `${content.slice(0, selectionStart)}${prefix}${selectedText}${suffix}${content.slice(selectionEnd)}`
    const nextSelectionStart = selectionStart + prefix.length

    setContent(nextContent)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextSelectionStart, nextSelectionStart + selectedText.length)
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!title.trim() || !content.trim()) {
      setErrorMessage('Tiêu đề và nội dung không được để trống.')
      return
    }

    setIsSubmitting(true)

    try {
      const post = await createPost({
        title: title.trim(),
        content: content.trim(),
        contentType: 'BLOG',
        tagNames: selectedTagNames,
      })

      navigate(`/posts/${post.id}`, { state: { post } })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Không thể đăng bài viết. Vui lòng thử lại.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="editor-app-shell">
      <AppNavbar />
      <StudySidebar />

      <main className="post-editor-page">
        <header className="editor-page-header">
          <div>
            <RouterLink to="/posts"><ArrowLeft size={17} /> Kho kiến thức</RouterLink>
            <h1>Tạo bài viết mới</h1>
            <p>Viết bằng Markdown và xem trước kết quả ngay lập tức.</p>
          </div>
        </header>

        <form className="post-editor-form" onSubmit={handleSubmit}>
          <section className="editor-meta-card" aria-label="Thông tin bài viết">
            <label className="editor-field">
              <span>Tiêu đề</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Hiểu sâu về Async/Await trong JavaScript"
                maxLength={180}
                required
              />
              <small>{title.length}/180</small>
            </label>

            <div className="editor-field editor-field--tags">
              <label htmlFor="tag-search">Tags</label>
              <div className="tag-selector">
                {selectedTagNames.length > 0 && (
                  <div className="selected-tag-list" aria-label="Tags đã chọn">
                    {selectedTagNames.map((tagName) => (
                      <button type="button" onClick={() => toggleTag(tagName)} key={tagName}>
                        {tagName}<X size={12} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="tag-search-field">
                  <Search size={15} aria-hidden="true" />
                  <input
                    id="tag-search"
                    type="search"
                    value={tagSearch}
                    onChange={(event) => setTagSearch(event.target.value)}
                    placeholder="Tìm tags..."
                    autoComplete="off"
                  />
                </div>

                <div className="available-tag-list" role="listbox" aria-label="Danh sách tags" aria-multiselectable="true">
                  {isLoadingTags && <p>Đang tải tags...</p>}
                  {!isLoadingTags && tagErrorMessage && <p className="tag-state-error">{tagErrorMessage}</p>}
                  {!isLoadingTags && !tagErrorMessage && filteredTags.length === 0 && <p>Không tìm thấy tag phù hợp.</p>}
                  {!isLoadingTags && !tagErrorMessage && filteredTags.map((tag) => {
                    const isSelected = selectedTagNames.includes(tag.name)

                    return (
                      <button
                        className={isSelected ? 'is-selected' : ''}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => toggleTag(tag.name)}
                        key={tag.id}
                      >
                        #{tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
              <small>Chọn một hoặc nhiều tags phù hợp với nội dung.</small>
            </div>
          </section>

          <section className="markdown-workspace">
            <div className="markdown-pane markdown-pane--editor">
              <header className="markdown-pane-header">
                <strong>Markdown</strong>
                <div className="markdown-toolbar" aria-label="Công cụ định dạng Markdown">
                  <button type="button" onClick={() => insertMarkdown('## ', '', 'Tiêu đề')} aria-label="Tiêu đề"><Heading2 size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('**', '**', 'in đậm')} aria-label="In đậm"><Bold size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('_', '_', 'in nghiêng')} aria-label="In nghiêng"><Italic size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('`', '`', 'code')} aria-label="Code inline"><Code2 size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('[', '](https://)', 'liên kết')} aria-label="Liên kết"><Link2 size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('- ', '', 'mục danh sách')} aria-label="Danh sách"><List size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('1. ', '', 'mục danh sách')} aria-label="Danh sách đánh số"><ListOrdered size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('> ', '', 'trích dẫn')} aria-label="Trích dẫn"><Quote size={16} /></button>
                </div>
              </header>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                aria-label="Nội dung Markdown"
                spellCheck="false"
                required
              />
            </div>

            <div className="markdown-pane markdown-pane--preview">
              <header className="markdown-pane-header"><strong><Eye size={16} /> Xem trước</strong></header>
              <article className="markdown-preview">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*Chưa có nội dung để xem trước.*'}</ReactMarkdown>
              </article>
            </div>
          </section>

          {errorMessage && <div className="editor-error" role="alert">{errorMessage}</div>}

          <footer className="editor-actions">
            <RouterLink to="/posts">Hủy</RouterLink>
            <button type="submit" disabled={isSubmitting}>
              <Send size={16} />
              {isSubmitting ? 'Đang đăng bài...' : 'Đăng bài viết'}
            </button>
          </footer>
        </form>
      </main>
    </div>
  )
}

export default CreatePostPage
