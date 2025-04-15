import { useState, useEffect } from 'react'
import AddNote from './components/AddNote'
import NoteList from './components/NoteList'
import Filter from './components/Filter'
import './App.css'

export default function App() {
  const [notes, setNotes] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [filter, setFilter] = useState('Все')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(
    localStorage.getItem('notifications') === 'enabled'
  )

  // 2-часовое напоминание о задачах
  useEffect(() => {
    const interval = setInterval(() => {
      const permission = Notification.permission
      const notificationsEnabled = localStorage.getItem('notifications') === 'enabled'

      if (permission === 'granted' && notificationsEnabled) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        const activeTasks = tasks.filter(task => !task.completed)

        if (activeTasks.length > 0) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(`У тебя ${activeTasks.length} невыполненных задач 🕒`, {
              body: 'Загляни и отметь, что сделал!',
              icon: '/icons/icon-192x192.png'
            })
          })
        }
      }
    }, 2 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Загрузка заметок из localStorage
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('notes')
      if (savedNotes) setNotes(JSON.parse(savedNotes))
    } catch (error) {
      console.error('Ошибка загрузки заметок:', error)
    }
  }, [])

  // Сохранение заметок в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('notes', JSON.stringify(notes))
    } catch (error) {
      console.error('Ошибка сохранения заметок:', error)
    }
  }, [notes])

  // Обработчики сетевого статуса
  useEffect(() => {
    const handleNetworkChange = () => {
      setIsOnline(navigator.onLine)
    }
    window.addEventListener('online', handleNetworkChange)
    window.addEventListener('offline', handleNetworkChange)
    return () => {
      window.removeEventListener('online', handleNetworkChange)
      window.removeEventListener('offline', handleNetworkChange)
    }
  }, [])

  // Обработчик установки PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallButton(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleAddNote = (text) => {
    if (!text.trim()) return
    const newNote = {
      id: Date.now(),
      text: text.trim(),
      date: new Date().toLocaleString(),
      completed: false
    }
    setNotes(prevNotes => [newNote, ...prevNotes])
    if (notificationsEnabled && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification('Новая заметка', { body: newNote.text })
      })
    }
  }

  const handleDeleteNote = (id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
  }

  const handleUpdateNote = (id, newText) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, text: newText.trim() } : note
      )
    )
  }

  const toggleNoteCompleted = (id) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, completed: !note.completed } : note
      )
    )
  }

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallButton(false)
    }
  }

  const handleNotificationToggle = () => {
    if (isSubscribed) {
      localStorage.setItem('notifications', 'disabled')
      setIsSubscribed(false)
      setNotificationsEnabled(false)
    } else {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          localStorage.setItem('notifications', 'enabled')
          setIsSubscribed(true)
          setNotificationsEnabled(true)
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification('Уведомления включены 👍')
          })
        } else {
          alert('Уведомления не были разрешены')
        }
      })
    }
  }

  const filteredNotes = notes.filter(note => {
    if (filter === 'Активные') return !note.completed
    if (filter === 'Выполненные') return note.completed
    return true
  })

  return (
    <div className="app-container">
      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          className="install-button"
          aria-label="Установить приложение"
        >
          ⬇️ Установить
        </button>
      )}

      <header className="app-header">
        <h1>Офлайн-Заметки</h1>
        {!isOnline && (
          <div className="offline-banner" role="status">
            ⚡ Офлайн-режим
          </div>
        )}
        <button
          onClick={handleNotificationToggle}
          className="notification-button"
          aria-label="Управление уведомлениями"
        >
          {isSubscribed ? 'Отключить уведомления' : 'Включить уведомления'}
        </button>
      </header>

      <main className="main-content">
        <AddNote onAdd={handleAddNote} />
        <Filter currentFilter={filter} setFilter={setFilter} />
        <NoteList
          notes={filteredNotes}
          onDelete={handleDeleteNote}
          onUpdate={handleUpdateNote}
          onToggleCompleted={toggleNoteCompleted}
        />
      </main>

      <footer className="app-footer">
        <p>Ваши данные сохраняются локально на устройстве</p>
      </footer>
    </div>
  )
}
