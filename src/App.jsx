import { useState } from 'react'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [results, setResults] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputText.trim()) {
      // For now, just echo the input as a test
      const newResult = {
        id: Date.now(),
        input: inputText,
        timestamp: new Date().toLocaleString()
      }
      setResults([newResult, ...results])
      setInputText('')
    }
  }

  return (
    <>
      <h1>PlanLlama AI Experiment</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1em',
              fontFamily: 'inherit',
              borderRadius: '8px',
              border: '1px solid #646cff',
              backgroundColor: '#1a1a1a',
              color: 'inherit',
              resize: 'vertical',
              marginBottom: '1em'
            }}
          />
          <button type="submit">Submit</button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="results">
          <h2>Results</h2>
          {results.map((result) => (
            <div key={result.id} className="result-item">
              <div className="result-timestamp">{result.timestamp}</div>
              <div className="result-content">{result.input}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default App
