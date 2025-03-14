import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Auth } from './pages/Auth'
import { Home } from './pages/Home'
import NavBar from './components/NavBar'
import { Loader } from './components/Loader'
import { useState, useEffect, createContext } from 'react'
import "./index.css"
import { supabase } from './lib/supabase'
import { useNavigate } from 'react-router-dom'


export const UserCollectionContext = createContext();

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
    let mounted = true

    const handleAuthChange = async (session) => {
      if (!mounted) return

      try {
        if (!session?.user) {
          setIsAuthenticated(false)
          setUserData(null)
          return
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (profileError) throw profileError

        if (mounted) {
          setIsAuthenticated(true)
          setUserData(userProfile)

          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }
      } catch (error) {
        console.error("Auth error:", error)
        if (mounted) {
          setIsAuthenticated(false)
          setUserData(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }}) => {
      handleAuthChange(session)
    })

    // Listen for auth changes
    const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setUserData(null)
        setIsLoading(false)
        navigate('/auth', { replace: true })
      } else {
        handleAuthChange(session)
      }
    })



    return () => {
      mounted = false
      subscription.unsubscribe()
    }
    
  }, [navigate])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-background w-full">
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
  const [userCollection, setUserCollection] = useState([]);

  const user = JSON.parse(localStorage.getItem('userProfile'));
  const user_id = user?.user_id;

  useEffect(()=>{
    const fetchUserCollection = async () => {
      if (!user_id) return;
      
      const { data, error } = await supabase
        .from('user_media')
        .select('*')
        .eq('user_id', user_id)
      if (error) {
        console.error("Error fetching user collection:", error);
        return;
      }
      setUserCollection(data)
      console.log("user collection fetched:", data)
    }

    fetchUserCollection()

  },[user_id])
  return (
    <UserCollectionContext.Provider value={{ userCollection, setUserCollection }}>
    <Router>
      <AuthenticatedContent />
    </Router>
    </UserCollectionContext.Provider>
  )
}

export default App
