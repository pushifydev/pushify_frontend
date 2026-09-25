"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    // Styled by .dash-switch in globals.css: hairline track, ink when on, thumb in --on-accent.
    className={cn("dash-switch", className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className="dash-switch-thumb" />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
