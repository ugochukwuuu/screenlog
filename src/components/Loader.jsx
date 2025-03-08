import React from 'react'

export function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-screen fixed top-0 left-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  )
}

export default Loader