import { useState } from 'react'

export default function AddNote({ onAdd }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault() // Важно предотвратить перезагрузку страницы
    if (!text.trim()) return // Проверка на пустой ввод
    
    onAdd(text)
    setText('') // Сброс поля ввода
  }

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Новая заметка..."
        aria-label="Текст заметки"
      />
      <button 
        type="submit" 
        className="add-button"
        disabled={!text.trim()} // Блокировка кнопки при пустом поле
      >
        Добавить
      </button>
    </form>
  )
}