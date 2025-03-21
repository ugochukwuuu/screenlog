import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { supabase } from "../lib/supabase"
import { cn } from "@/lib/utils"

import { FaGoogle } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";


export function Auth() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleGoogleAuth = async ()=>{
    console.log("googling")
    let { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
})
  }
  const handleLogin = async (e) => {
    setIsLoggingIn(true);
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
      .select('username')
      .eq('user_id', data.user.id)
      .single()

    if (userProfile) {
      navigate(`/${userProfile.username}`)
      setIsLoggingIn(false)
    }
  }

  const handleSignup = async (e) => {
    console.log("Signing up the user now")
    setIsSigningIn(true);
    try {
      //first check if the username is available
      //then sign up the user with auth
      //then manually insert the users detail into the users table

      console.log("Checking username availability...", formData.username)
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
        setIsSigningIn(false);
      }
      console.log("existing user", existingUser   )
      console.log("Username is available, proceeding with sign up...")
      console.log("Signup payload:", {
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })

      let { data, error : signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
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
            username: formData.username,  
            email: user.email.trim(),
            user_id: user.id,
          })
          .select()

        if (profileError) {
          console.error("Profile creation error:", profileError)
          throw profileError
        }

        // console.log("User profile created successfully:", profileData)
        
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

      if (isSignUp && formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      if (!isSignUp) {
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
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
      <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
          onSubmit={handleSubmit} 
          className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>  
                <p className="text-balance text-muted-foreground">
                  Login to your screenLog account
                </p>
              </div>
              {error && (
                <>
                  <p className="text-sm text-red-600">{error}</p>
                </>
              )}
              {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" 
                onChange = {handleChange}
                value = {formData.username}
                name = "username"
                type="text" placeholder="Enter your username" required />
              </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email"
                type="email"
                placeholder="m@example.com"
                onChange = {handleChange}
                name = "email"
                value = {formData.email}
                required />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                <div className="flex items-center relative">
                <Input id="password1" 
                name = "password"
                type={showPassword? "text" : "password"}
                required  placeholder="Enter your password"
                onChange = {handleChange}
                value = {formData.password}
                className="relative"/>
                {showPassword? <FaRegEye 
                onClick={() => setShowPassword(false)}
                className="ml-2 cursor-pointer absolute right-4"/> : 
                <FaRegEyeSlash 
                onClick={() => setShowPassword(true)} 
                className="ml-2 cursor-pointer absolute right-4"/>}
                </div>
              </div>
              {isSignUp && (
              <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                <div className="flex items-center relative">
                <Input id="password2"
                name = "confirmPassword"
                onChange = {handleChange}
                value = {formData.confirmPassword } 
                type={showPassword? "text" : "password"}
                required  placeholder="Enter your password"
                className="relative"/>
               
                </div>
              </div>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div
                className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="">
                <Button
                type = "button"
                onClick = {()=>handleGoogleAuth()} 
                variant="outline" className="w-full">
                <FaGoogle />
                  <span className="sr-only">Login with Google</span>
                </Button>
              </div>
              <div className="text-sm flex justify-center items-center gap-2 ">
                Don&apos;t have an account?{" "}
                <div
                 className="">
                 <button type="button"
                 onClick = {()=> setIsSignUp(!isSignUp)}
                  className="cursor-pointer">
                  {isSignUp? "Login" : "Sign Up"}
                 </button>
                </div>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          </div>
        </CardContent>
      </Card>
      <div
        className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
    </div>
    </div>
  )
} 