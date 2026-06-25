import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/Header.tsx'
import MainLayout from './components/MainLayout.tsx'
import { ErrorPage } from './pages/ErrorPage'
import { ProjectFormPage } from './pages/ProjectFormPage'
import { ProjectListPage } from './pages/ProjectListPage'

function App() {

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route
          path="/error"
          element={(
            <div className="min-h-screen bg-slate-50 text-slate-600">
              <Header />
              <ErrorPage />
            </div>
          )}
        />
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
