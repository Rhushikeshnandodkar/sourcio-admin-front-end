"use client";

import { CheckIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="min-h-[2rem] min-w-[2rem] shrink-0"
        >
          <Sun className="h-[1rem] w-[1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1rem] w-[1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-20 font-poppins">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center ${theme === "light" ? "bg-secondary/70" : ""}`}
        >
          {theme === "light" ? (
            <div className="flex w-full items-center justify-between text-xs">
              Light
              <CheckIcon className="mr-2 h-4 w-4 text-green-400" />
            </div>
          ) : (
            <div className="flex w-full items-center justify-between text-xs">
              Light
            </div>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center ${theme === "dark" ? "bg-secondary/70" : ""}`}
        >
          {theme === "dark" ? (
            <div className="flex w-full items-center justify-between text-xs">
              Dark
              <CheckIcon className="mr-2 h-4 w-4 text-green-400" />
            </div>
          ) : (
            <div className="text-xs">Dark</div>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center ${theme === "system" ? "bg-secondary/70" : ""}`}
        >
          {theme === "system" ? (
            <div className="flex w-full items-center justify-between text-xs">
              System
              <CheckIcon className="mr-2 h-4 w-4 text-green-400" />
            </div>
          ) : (
            <div className="text-xs">System</div>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
