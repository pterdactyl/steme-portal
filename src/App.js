// src/App.js
import { Routes, Route } from 'react-router-dom'
import Pathways from './pathways'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Pathways />} />
    </Routes>
  )
}

export default App