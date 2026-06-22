import { Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout.tsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />} />
      </Routes>
    </>
  )
}

export default App
