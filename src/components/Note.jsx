import { useState } from 'react'

export default function Note({ note, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(note.text)

  const handleUpdate = () => {
    onUpdate(note.id, editText)
    setIsEditing(false)
  }

  return (
    <div className="note-card">
      {isEditing ? (
        <div className="edit-mode">
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
          />
          <div className="edit-actions">
            <button onClick={handleUpdate}>Сохранить</button>
            <button onClick={() => setIsEditing(false)}>Отмена</button>
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <p>{note.text}</p>
          <div className="note-actions">
            <button onClick={() => setIsEditing(true)}>✏️</button>
            <button onClick={() => onDelete(note.id)}>🗑️</button>
          </div>
        </div>
      )}
    </div>
  )
}