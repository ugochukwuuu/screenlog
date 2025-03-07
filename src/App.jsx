import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Auth } from './pages/Auth'
import { Home } from './pages/Home'
import NavBar from './components/NavBar'
import { useState, useEffect } from 'react'
import "./index.css"
import { supabase } from './lib/supabase'

const ProtectedRoute = ({ isAuthenticated, redirectPath = '/auth', children }) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }
  return children ? children : <Outlet />
}

function Layout() {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {

    // const getUser = async () =>{
    //   const { data: { user } } = await supabase.auth.getUser()
    //  setUserData(user);
    //   console.log(userData)
    // }

    // getUser()
    console.log(userData)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {isAuthenticated  && (<NavBar/>)}
        <Routes>
          <Route 
            path="/auth" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />} 
          />
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
