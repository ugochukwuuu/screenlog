import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { supabase } from "../lib/supabase"

export function Auth() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e) => {
    console.log("Attempting to sign in...")
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password
    })
    console.log("Sign in response:", { data, error })

    if (error) throw error

    // Get user profile to get username
    const { data: userProfile } = await supabase
      .from('users')
      .select('name')
      .eq('user_id', data.user.id)
      .single()

    if (userProfile) {
      navigate(`/${userProfile.name}`)
    }
  }

  const handleSignup = async (e) => {
    console.log("Signing up the user now")
    try {
      //first check if the username is available
      //then sign up the user with auth
      //then manually insert the users detail into the users table

      console.log("Checking username availability...")
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error checking username:", checkError)
        throw new Error("Error checking username availability")
      }

      if (existingUser) {
        throw new Error("Username is already taken")
      }

      console.log("Username is available, proceeding with sign up...")
      console.log("Signup payload:", {
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      
      console.log("Sign up response:", { data, error: signUpError })
      
      if (signUpError) {
        console.error("Sign up error:", signUpError)
        throw signUpError
      }

      if (!data?.user) {
        console.error("No user in signup response:", data)
        throw new Error("Failed to create account. Please try again.")
      }

      const user = data.user
      console.log("Auth user created successfully:", user)

      try {
        console.log("Attempting to create user profile...")
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            name: formData.username,
            email: user.email,
            user_id: user.id,
          })
          .select()

        if (profileError) {
          console.error("Profile creation error:", profileError)
          throw profileError
        }

        console.log("User profile created successfully:", profileData)
        
      } catch (error) {
        console.error("User profile creation failed:", error)
        throw error
      } finally{
        // Navigate to user's profile page after successful signup
        navigate(`/${formData.username}`)
      }

      console.log("Sign up process completed")
    } catch(error) {
      console.error("there was an error signing up", error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all fields")
      }

      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      if (isLogin) {
        await handleLogin()
      } else {
        await handleSignup()
      }
      
    } catch (error) {
      console.error("Auth error:", error)
      setError(error.message || "An error occurred during authentication")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Enter your details to create your account"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>

                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  onChange={handleChange}
                  value={formData.username}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>Loading...</>
              ) : (
                isLogin ? "Sign in" : "Sign up"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
              disabled={isLoading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 