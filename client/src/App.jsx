import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat'
import NotFound from './components/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
