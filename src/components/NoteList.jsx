import Note from './Note' // Добавьте этот импорт

export default function NoteList({ notes, onDelete, onUpdate }) {
  return (
    <div className="notes-container">
      {notes.length === 0 ? (
        <p className="empty-state">Нет заметок</p>
      ) : (
        notes.map((note) => (
          <Note
            key={note.id}
            note={note}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))
      )}
    </div>
  )
}