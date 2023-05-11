import './resultDisplay.css';

function ResultDisplay({ result }) {
    if (!result) {
        return null;
    }

    const { positions, time, timeMatrix } = result;

    return (
        <div className="result-display dark:text-black">
        <p className="result-display__title">Fastest path:</p>
        <ul className="result-display__list">
        {positions.map((pos, index) => (
            <li key={pos} className="result-display__list-item">
            {pos}
            {index < positions.length - 1 && (
                <>
                <span> &#8594; </span>
                <span>{positions[index + 1]}: </span>
                <span className="result-display__list-arrow">
                    <span>{timeMatrix[pos][positions[index + 1]]} seconds </span>
                </span>
                </>
            )}
            </li>
        ))}
        </ul>
        <p className="result-display__time">Total time: {time.toFixed(2)} seconds</p>
    </div>
    );
}

export default ResultDisplay;