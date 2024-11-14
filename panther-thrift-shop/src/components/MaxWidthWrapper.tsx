/**
 * MaxWidthWrapper.tsx
 *
 * This file defines the `MaxWidthWrapper` component for the Panther Thrift Shop web application.
 * The `MaxWidthWrapper` component is a layout utility that centers its children content and
 * constrains the maximum width of the page. It provides consistent padding and spacing across
 * different screen sizes, ensuring a responsive and well-aligned layout.
 *
 * Key Features:
 * - Centers the content with a maximum width constraint (`max-w-screen-xl`).
 * - Applies padding for small and medium screen sizes using Tailwind CSS utilities.
 * - Supports additional custom styling via the `className` prop.
 *
 * Dependencies:
 * - Tailwind CSS for styling.
 * - `cn` utility function for conditional class names.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 */

import React from "react";
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) => {
  return (
    <div
      className={cn(
        'h-full mx-auto w-full max-w-screen-xl px-2.5 md:px-20',
        className
      )}>
      {children}
    </div>
  )
}

export default MaxWidthWrapper