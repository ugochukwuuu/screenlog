import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Auth } from './pages/Auth'
import { Home } from './pages/Home'
import Collections  from './pages/Collections'
import NavBar from './components/NavBar'
import { Loader } from './components/Loader'
import { useState, useEffect, createContext, useContext } from 'react'
import "./index.css"
import { supabase } from './lib/supabase'

export const UserCollectionContext = createContext();
export const UserProfileContext = createContext();

const ProtectedRoute = ({ isAuthenticated, redirectPath = '/auth', children }) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }
  return children ? children : <Outlet />
}


function AuthenticatedContent() {
  const { user, setUser } = useContext(UserProfileContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const handleAuthChange = async (session) => {
      if (!mounted) return

      try {
        if (!session?.user) {
          setIsAuthenticated(false)
          setUser(null)
          navigate('/auth',{replace:true})
          return
        }

        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error) throw error

        if (mounted) {
          setIsAuthenticated(true)
          setUser(userProfile)
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }
      } catch (error) {
        console.error("Auth error:", error)
        if (mounted) {
          setIsAuthenticated(false)
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        navigate('/auth', { replace: true })
      } else {
        handleAuthChange(session)
      }
    })

    supabase.auth.getSession().then(({ data: { session }}) => {
      handleAuthChange(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
    
  }, [navigate, setUser, user])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {isAuthenticated && <NavBar userData={user} />}
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/search" replace /> : <Auth />}
        />
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path = "/" element ={<Navigate to = "/search" replace/>}/>
          <Route path="/search" element={<Home userData={user} />} />
          <Route path="/:username" element={<Home userData={user} />} />
          <Route path = "/:username/collections" element = {<Collections/>}/>
          <Route path="*" element={<Navigate to="/search" replace />} />
        </Route>
      </Routes>
    </div>
  )
}

function App() {
  const [userCollection, setUserCollection] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchUserCollection = async () => {
      if (!user?.user_id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_media')
          .select('*')
          .eq('user_id', user.user_id)

        if (error) throw error;

        if (mounted) {
          setUserCollection(data || []);
          console.log(userCollection)
        }
      } catch (error) {
        console.error("Error fetching user collection:", error);
      }
    };

    fetchUserCollection();

    const subscription = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_media',
          filter: `user_id=eq.${user?.user_id}`
        }, fetchUserCollection)
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user?.user_id]);

  return (
    <UserCollectionContext.Provider value={{ userCollection, setUserCollection }}>
      <UserProfileContext.Provider value={{ user, setUser }}>
        <Router>
          <AuthenticatedContent />
        </Router>
      </UserProfileContext.Provider>
    </UserCollectionContext.Provider>
  )
}

export default App;
