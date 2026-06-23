import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout.tsx'
import { ProjectListPage } from './pages/ProjectListPage'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectListPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
