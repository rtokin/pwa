import { useState } from 'react';

export default function NoteItem({ note, onDelete, onUpdate, onToggleCompleted }) {
  // Состояние для отслеживания режима редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);

  // Функция сохранения изменений заметки
  const handleSave = () => {
    // Можно добавить дополнительную валидацию editText.trim()
    if (editText.trim() && editText.trim() !== note.text) {
      onUpdate(note.id, editText);
    }
    setIsEditing(false);
  };

  return (
    <div className={`note-item ${note.completed ? 'completed' : ''}`}>
      {isEditing ? (
        // Режим редактирования: выводим input и кнопки "Сохранить" и "Отмена"
        <div className="edit-section">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="edit-input"
          />
          <button onClick={handleSave} className="note-action-button">
            Сохранить
          </button>
          <button onClick={() => { setIsEditing(false); setEditText(note.text); }} className="note-action-button">
            Отмена
          </button>
        </div>
      ) : (
        // Режим просмотра: выводим текст заметки и дату
        <>
          <p>{note.text}</p>
          <small>{note.date}</small>
          <div className="note-actions">
            <button onClick={() => onToggleCompleted(note.id)} className="note-action-button">
              {note.completed ? 'Отметить как активную' : 'Отметить как выполненную'}
            </button>
            <button onClick={() => setIsEditing(true)} className="note-action-button">
              Редактировать
            </button>
            <button onClick={() => onDelete(note.id)} className="note-action-button">
              Удалить
            </button>
          </div>
        </>
      )}
    </div>
  )
}