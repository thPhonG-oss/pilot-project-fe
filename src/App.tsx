import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout.tsx'
import { ProjectFormPage } from './pages/ProjectFormPage'
import { ProjectListPage } from './pages/ProjectListPage'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/new" element={<ProjectFormPage mode="create" />} />
          <Route path="/projects/:projectId/edit" element={<ProjectFormPage mode="edit" />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
