import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Auth } from './pages/Auth'
import { Home } from './pages/Home'
import NavBar from './components/NavBar'
import { Loader } from './components/Loader'
import { useState, useEffect } from 'react'
import "./index.css"
import { supabase } from './lib/supabase'
import { useNavigate } from 'react-router-dom'

const ProtectedRoute = ({ isAuthenticated, redirectPath = '/auth', children }) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }
  return children ? children : <Outlet />
}


function AuthenticatedContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          if (profileError) {
            console.error("Error fetching user profile:", profileError)
            throw profileError
          }
  
          setIsAuthenticated(true)
          setUserData(userProfile)
        } else {
          setIsAuthenticated(false)
          setUserData(null)
        }
      } catch (error) {
        console.error("Session check error:", error)
        setIsAuthenticated(false)
        setUserData(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoading(true)
      
      const updateState = async () => {
        try {
          if (_event === 'SIGNED_OUT') {
            setIsAuthenticated(false)
            setUserData(null)
            setIsLoading(false)
            navigate('/auth', { replace: true })
            return
          }
  
          if (session?.user) {
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', session.user.id)
              .single()
            
            if (profileError) {
              console.error("Error fetching user profile:", profileError)
              throw profileError
            }
  
            setIsAuthenticated(true)
            setUserData(userProfile)
          } else {
            setIsAuthenticated(false)
            setUserData(null)
          }
        } catch (error) {
          console.error("Auth state change error:", error)
          setIsAuthenticated(false)
          setUserData(null)
        } finally {
          setIsLoading(false)
        }
      }

      updateState()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <NavBar userData={userData} />}
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />} 
        />
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<Home userData={userData} />} />
          <Route path="/:username" element={<Home userData={userData} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthenticatedContent />
    </Router>
  )
}

export default App
