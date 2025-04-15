import { useState, useEffect } from 'react'
import AddNote from './components/AddNote'
import NoteList from './components/NoteList'
import Filter from './components/Filter'
import './App.css' // новый или обновлённый стиль для обновлённого интерфейса

export default function App() {
  // Состояния приложения
  const [notes, setNotes] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [filter, setFilter] = useState('Все') // новый фильтр
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

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

  // Функции для работы с заметками
  const handleAddNote = (text) => {
    if (!text.trim()) return
    const newNote = {
      id: Date.now(),
      text: text.trim(),
      date: new Date().toLocaleString(),
      completed: false // новое поле состояния выполнения
    }
    setNotes(prevNotes => [newNote, ...prevNotes])
    // Пример уведомления при добавлении заметки, если уведомления включены
    if (notificationsEnabled && Notification.permission === 'granted') {
      new Notification('Новая заметка', { body: newNote.text })
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

  // Функция для переключения статуса заметки (выполнена/активна)
  const toggleNoteCompleted = (id) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, completed: !note.completed } : note
      )
    )
  }

  // Обработчик установки приложения
  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallButton(false)
    }
  }

  // Обработчик запроса уведомлений
  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Ваш браузер не поддерживает уведомления")
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      setNotificationsEnabled(true)
    } else {
      setNotificationsEnabled(false)
      alert("Уведомления не были разрешены")
    }
  }

  // Фильтрация заметок по выбранному фильтру
  const filteredNotes = notes.filter(note => {
    if (filter === 'Активные') return !note.completed
    if (filter === 'Выполненные') return note.completed
    return true // 'Все'
  })

  return (
    <div className="app-container">
      {/* Кнопка установки PWA */}
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
        {/* Новая кнопка для включения уведомлений */}
        <button 
          onClick={handleEnableNotifications}
          className="notification-button"
          aria-label="Включить уведомления"
        >
          Включить уведомления
        </button>
      </header>

      <main className="main-content">
        <AddNote onAdd={handleAddNote} />
        {/* Компонент для фильтрации заметок */}
        <Filter currentFilter={filter} setFilter={setFilter} />
        <NoteList 
          notes={filteredNotes}
          onDelete={handleDeleteNote}
          onUpdate={handleUpdateNote}
          onToggleCompleted={toggleNoteCompleted} // передаём функцию для переключения статуса
        />
      </main>

      <footer className="app-footer">
        <p>Ваши данные сохраняются локально на устройстве</p>
      </footer>
    </div>
  )
}
