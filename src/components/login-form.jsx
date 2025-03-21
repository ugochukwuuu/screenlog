import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

import { FaGoogle } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

export function LoginForm({
  className,
  ...props
}) {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleLogin = () =>{
    setIsLogin(!isLogin)
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>  
                <p className="text-balance text-muted-foreground">
                  Login to your screenLog account
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="Enter your username" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                <div className="flex items-center relative">
                <Input id="password" type={showPassword? "text" : "password"} required  placeholder="Enter your password" className="relative"/>
                {showPassword? <FaRegEye 
                onClick={() => setShowPassword(false)}
                className="ml-2 cursor-pointer absolute right-4"/> : 
                <FaRegEyeSlash 
                onClick={() => setShowPassword(true)} 
                className="ml-2 cursor-pointer absolute right-4"/>}
                </div>
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                <div className="flex items-center relative">
                <Input id="password" type={showPassword? "text" : "password"} required  placeholder="Enter your password" className="relative"/>
               
                </div>
              </div>
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
                <Button variant="outline" className="w-full">
                <FaGoogle />
                  <span className="sr-only">Login with Google</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <button 
                onClick = {()=> setIsLogin()}
                 className="">
                  {isLogin? "Sign up" : "Login"}
                </button>
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
  );
}
