import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-600">
        <Header />
        <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  )
}
