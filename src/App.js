// src/App.js
import { Routes, Route } from 'react-router-dom'
import Login from './Auth/login'
import SignUp from './Auth/signup'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  )
}

export default App
