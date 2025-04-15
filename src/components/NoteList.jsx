import NoteItem from './NoteItem'

export default function NoteList({ notes, onDelete, onUpdate, onToggleCompleted }) {
  return (
    <div className="note-list">
      {notes.map(note => (
        <NoteItem 
          key={note.id} 
          note={note} 
          onDelete={onDelete} 
          onUpdate={onUpdate}
          onToggleCompleted={onToggleCompleted} 
        />
      ))}
    </div>
  )
}