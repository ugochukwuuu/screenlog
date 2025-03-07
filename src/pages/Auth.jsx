import { useState } from "react"
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
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

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
        console.log("Attempting to sign in...")
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password
        })
        console.log("Sign in response:", { data, error })
    
        if (error) throw error
      } else {
        console.log("Attempting to sign up...")
        const { user, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            emailRedirectTo: window.location.origin
          }
        })
        if(user){
          try{
            const { data, error } = await supabase.from('users').insert({
              username: formData.username,
              email: user.email,
              user_id: user.id,
            })
            if(data){
              console.log("User created successfully")
            } else {
              console.log("User creation failed")
            }
          } catch (error) {
            console.error("User creation error:", error)
          }
        }
        console.log("Sign up response:", { user, error })
        if (error) throw error
        
        if (!user) {
          throw new Error("Failed to create account")
        }
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