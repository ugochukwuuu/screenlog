import React, { useState } from 'react'
import { Link } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader } from './Loader'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Library, List, LogOut } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

const NavBar = ({ userData }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setLoggingOut] = useState(false);

  
  const handleLogout = async () => {
    console.log("Logging out...")
    setLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      console.log("Successfully logged out")
    } catch (error) {
      console.error("Error logging out:", error)
      setLoggingOut(false)
    }
  }

  return (
    <nav className="border-b relative">
      {isLoggingOut && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50">
          <Loader />
        </div>
      )}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          MovieTrackr
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none flex items-center gap-2">
            <div className="text-sm mr-2">
              {userData?.name}
            </div>
            <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/50 transition">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{userData?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link to={`/${userData?.name}`} className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/collections" className="flex items-center cursor-pointer">
                <Library className="mr-2 h-4 w-4" />
                <span>My Collections</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/watchlist" className="flex items-center cursor-pointer">
                <List className="mr-2 h-4 w-4" />
                <span>Watchlist</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="flex items-center cursor-pointer text-red-500 focus:text-red-500"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

export default NavBar