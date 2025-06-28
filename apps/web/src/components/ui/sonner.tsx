"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors={true} // Enable rich colors for better color support
      closeButton={true}
      duration={4000}
      visibleToasts={5}
      toastOptions={{
        // Default toast styling
        className: "toast-custom",
        style: {
          fontFamily: "var(--font-general-sans)",
          borderRadius: "var(--radius-lg)",
        },
        // Custom styling for different toast types
        classNames: {
          toast: "toast-custom",
          title: "toast-title",
          description: "toast-description",
          success: "toast-success",
          error: "toast-error",
          warning: "toast-warning",
          info: "toast-info",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }