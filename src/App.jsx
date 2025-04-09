import { useState, useEffect } from 'react'
import AddNote from './components/AddNote'
import NoteList from './components/NoteList'

export default function App() {
  // Состояния приложения
  const [notes, setNotes] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

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
    const newNote = {
      id: Date.now(),
      text: text.trim(),
      date: new Date().toLocaleString()
    }
    setNotes(prevNotes => [newNote, ...prevNotes])
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

  // Обработчик установки приложения
  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallButton(false)
    }
  }

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
        <h1>📝 Офлайн-Заметки</h1>
        {!isOnline && (
          <div className="offline-banner" role="status">
            ⚡ Офлайн-режим
          </div>
        )}
      </header>

      <main className="main-content">
        <AddNote onAdd={handleAddNote} />
        <NoteList 
          notes={notes}
          onDelete={handleDeleteNote}
          onUpdate={handleUpdateNote}
        />
      </main>

      <footer className="app-footer">
        <p>Ваши данные сохраняются локально на устройстве</p>
      </footer>
    </div>
  )
}