import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'

const Icon = ({ name, size = 18 }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></>,
    library: <><path d="M4 19.5V6.2a1.7 1.7 0 0 1 1.7-1.7H20v13.8H5.7A1.7 1.7 0 0 0 4 20Z" /><path d="M4 19.8a1.8 1.8 0 0 0 1.8 1.7H20" /></>,
    settings: <><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="m19.4 15 .1.1a1.6 1.6 0 0 1-2.3 2.3l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V18.6a1.6 1.6 0 0 1-3.2 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a1.6 1.6 0 0 1-2.3-2.3l.1-.1a1.6 1.6 0 0 0-1.1-2.7H5a1.6 1.6 0 0 1 0-3.2h.2a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a1.6 1.6 0 0 1 2.3-2.3l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a1.6 1.6 0 0 1 3.2 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.6 1.6 0 0 1 2.3 2.3l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a1.6 1.6 0 0 1 0 3.2h-.2a1.6 1.6 0 0 0-1.1 2.5Z" /></>,
    send: <><path d="m21 3-7.2 18-3.6-7.2L3 10.2 21 3Z" /><path d="M10.2 13.8 21 3" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    sparkle: <><path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3L12 3Z" /><path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const suggestions = [
  { title: 'Explore a topic', text: 'Give me a clear overview of a topic I am curious about', icon: 'compass' },
  { title: 'Plan a project', text: 'Help me turn an idea into a practical step-by-step plan', icon: 'library' },
  { title: 'Write something', text: 'Draft, improve, or brainstorm anything you are working on', icon: 'sparkle' },
]

const Dashboard = () => {
  const chat = useChat()
  const [chatInput, setChatInput] = useState('')
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const isLoading = useSelector((state) => state.chat.isLoading)
  const error = useSelector((state) => state.chat.error)
  const user = useSelector((state) => state.auth.user)
  const chatList = useMemo(() => Object.values(chats).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)), [chats])
  const activeChat = chats[currentChatId]
  const displayName = user?.username || user?.name || 'there'

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [chat])

  const submitMessage = (event) => {
    event.preventDefault()
    const message = chatInput.trim()
    if (!message || isLoading) return
    chat.handleSendMessage({ message, chatId: currentChatId })
    setChatInput('')
  }

  const selectChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
    setMobileSidebar(false)
  }

  const newChat = () => {
    setChatInput('')
    chat.handleOpenChat(null, chats)
    setMobileSidebar(false)
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileSidebar ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><Icon name="sparkle" size={16} /></span><span>Perplexity</span></div>
        <button className="new-chat-button" type="button" onClick={newChat}><Icon name="plus" size={17} /> New thread <span className="shortcut">⌘ K</span></button>
        <nav className="primary-nav" aria-label="Main navigation">
          <button className="nav-item active" type="button"><Icon name="compass" /> Discover</button>
          <button className="nav-item" type="button"><Icon name="library" /> Library</button>
        </nav>
        <div className="history-heading"><span>Recent threads</span><button type="button" aria-label="Search threads"><Icon name="search" size={16} /></button></div>
        <div className="thread-list">
          {chatList.length === 0 && <p className="empty-sidebar">Your conversations will appear here.</p>}
          {chatList.map((item) => <button className={`thread-item ${item.id === currentChatId ? 'selected' : ''}`} key={item.id} type="button" onClick={() => selectChat(item.id)}>{item.title || 'Untitled thread'}</button>)}
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" type="button"><Icon name="settings" /> Settings</button>
          <div className="account"><span className="avatar">{displayName.slice(0, 1).toUpperCase()}</span><span className="account-name">{displayName}</span><span className="account-plan">Free</span></div>
        </div>
      </aside>
      {mobileSidebar && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setMobileSidebar(false)} />}

      <section className="workspace">
        <header className="topbar"><button className="menu-button" type="button" onClick={() => setMobileSidebar(true)} aria-label="Open menu">☰</button><span className="mobile-title">Perplexity</span><div className="topbar-actions"><button className="icon-button" type="button" aria-label="Search"><Icon name="search" /></button><button className="upgrade-button" type="button">Upgrade <Icon name="arrow" size={15} /></button></div></header>
        <div className={`conversation ${activeChat ? 'has-chat' : ''}`}>
          {activeChat ? (
            <div className="message-stream">
              <div className="conversation-title"><span>Thread</span><h1>{activeChat.title || 'New conversation'}</h1></div>
              {activeChat.messages.map((message, index) => <article className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`} key={`${message.role}-${index}`}>
                {message.role !== 'user' && <span className="assistant-mark"><Icon name="sparkle" size={15} /></span>}
                <div className="message-content">{message.role === 'user' ? <p>{message.content}</p> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>}</div>
              </article>)}
              {isLoading && <div className="typing-indicator"><span /><span /><span /> Thinking</div>}
            </div>
          ) : (
            <div className="welcome">
              <div className="welcome-mark"><Icon name="sparkle" size={25} /></div>
              <p className="eyebrow">A new way to search</p>
              <h1>What will you discover<br /><em>today, {displayName}?</em></h1>
              <p className="welcome-copy">Ask anything. Get a clear, sourced answer and keep exploring with Perplexity.</p>
              <div className="suggestions">{suggestions.map((item) => <button className="suggestion-card" type="button" key={item.title} onClick={() => setChatInput(item.text)}><span className="suggestion-icon"><Icon name={item.icon} size={19} /></span><span><strong>{item.title}</strong><small>{item.text}</small></span><Icon name="arrow" size={16} /></button>)}</div>
            </div>
          )}
        </div>
        <div className="composer-wrap">
          {error && <div className="error-banner" role="alert">{error}</div>}
          <form className="composer" onSubmit={submitMessage}><textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitMessage(event) } }} placeholder="Ask anything..." rows="1" aria-label="Message" /><div className="composer-footer"><span className="composer-hint">Press Enter to send · Shift + Enter for a new line</span><button className="send-button" type="submit" disabled={!chatInput.trim() || isLoading} aria-label="Send message"><Icon name="send" size={17} /></button></div></form>
          <p className="disclaimer">Perplexity can make mistakes. Check important info.</p>
        </div>
      </section>
    </main>
  )
}

export default Dashboard
