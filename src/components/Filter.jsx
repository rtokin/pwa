export default function Filter({ currentFilter, setFilter }) {
    const filters = ['Все', 'Активные', 'Выполненные']

    return (
        <div className="filter-container">
            {filters.map(f => (
                <button
                    key={f}
                    className={`filter-button ${currentFilter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                >
                    {f}
                </button>
            ))}
        </div>
    )
}