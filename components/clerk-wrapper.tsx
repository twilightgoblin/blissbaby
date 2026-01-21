"use client"

import { useEffect, useState } from 'react'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

interface ClerkSignInButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  asChild?: boolean
}

export function ClerkSignInButton({ variant = "outline", size = "sm", className = "", children, onClick, asChild = false }: ClerkSignInButtonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    if (asChild) {
      return (
        <button className={className} disabled onClick={onClick}>
          {children || "Sign In"}
        </button>
      )
    }
    return (
      <Button variant={variant} size={size} className={className} disabled>
        {children || "Sign In"}
      </Button>
    )
  }

  return (
    <SignInButton mode="modal">
      {asChild ? (
        <button className={className} onClick={onClick}>
          {children || "Sign In"}
        </button>
      ) : (
        <Button variant={variant} size={size} className={className}>
          {children || "Sign In"}
        </Button>
      )}
    </SignInButton>
  )
}

export function ClerkSignUpButton({ variant = "default", size = "sm", className = "", children, onClick, asChild = false }: ClerkSignInButtonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    if (asChild) {
      return (
        <button className={className} disabled onClick={onClick}>
          {children || "Sign Up"}
        </button>
      )
    }
    return (
      <Button variant={variant} size={size} className={className} disabled>
        {children || "Sign Up"}
      </Button>
    )
  }

  return (
    <SignUpButton mode="modal">
      {asChild ? (
        <button className={className} onClick={onClick}>
          {children || "Sign Up"}
        </button>
      ) : (
        <Button variant={variant} size={size} className={className}>
          {children || "Sign Up"}
        </Button>
      )}
    </SignUpButton>
  )
}