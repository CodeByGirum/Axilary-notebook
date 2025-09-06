"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Power, Cpu, Zap, Globe, X, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  width: number
  onClose: () => void
  onToggle: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onResizeStart: (e: React.MouseEvent) => void
  isResizing: boolean
}

export function Sidebar({
  isOpen,
  isCollapsed,
  width,
  onClose,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  onResizeStart,
  isResizing,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState({})
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  const [selectedMachine, setSelectedMachine] = useState("cpu-basic")
  const [selectedEnvironment, setSelectedEnvironment] = useState("python-310-ds")
  const [selectedShutdown, setSelectedShutdown] = useState("15min")
  const [machineRunning, setMachineRunning] = useState(false)
  const [showShutdownMenu, setShowShutdownMenu] = useState(false)

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setIsHovering(true)
    onMouseEnter?.()
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false)
      onMouseLeave?.()
    }, 500) // 500ms delay before hiding
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleMachine = () => {
    setMachineRunning(!machineRunning)
  }

  const machineOptions = [
    { value: "cpu-basic", label: "CPU (Basic)", specs: "2 vCPU, 5 GB memory", price: "Free", internet: true },
    { value: "cpu-plus", label: "CPU (Plus)", specs: "4 vCPU, 16 GB memory", price: "$0.38/h", internet: true },
    {
      value: "cpu-performance",
      label: "CPU (Performance)",
      specs: "16 vCPU, 64 GB memory",
      price: "$1.54/h",
      internet: true,
    },
    {
      value: "cpu-high-memory",
      label: "CPU (High memory)",
      specs: "16 vCPU, 128 GB memory",
      price: "$2.02/h",
      internet: true,
    },
    { value: "gpu-t4", label: "GPU (T4)", specs: "8 vCPU, 32 GB memory, 16 GB VRAM", price: "$0.14/h", internet: true },
    {
      value: "gpu-l4",
      label: "GPU (L4)",
      specs: "16 vCPU, 64 GB memory, 24 GB VRAM",
      price: "$1.56/h",
      internet: true,
    },
    {
      value: "gpu-a100",
      label: "GPU (2x A100)",
      specs: "24 vCPUs, 128 GB memory, 2x A100",
      price: "Contact us",
      internet: true,
    },
    { value: "spark", label: "Spark cluster", specs: "On-demand serverless", price: "Contact us", internet: true },
    { value: "cloud", label: "Your own cloud", specs: "Run on AWS/GCP/Azure", price: "Contact us", internet: false },
    { value: "local", label: "Local machine", specs: "Run locally", price: "Contact us", internet: false },
  ]

  const environmentOptions = [
    { value: "dockerfile", label: "Dockerfile", description: "Custom Docker environment", version: "Latest" },
    { value: "python-310", label: "Python 3.10", description: "Standard Python runtime", version: "3.10.12" },
    {
      value: "python-310-ds",
      label: "Python 3.10 for data science",
      description: "NumPy, Pandas, Matplotlib included",
      version: "3.10.12 (Default)",
    },
    { value: "python-311", label: "Python 3.11", description: "Standard Python runtime", version: "3.11.8" },
    {
      value: "python-311-ds",
      label: "Python 3.11 for data science",
      description: "NumPy, Pandas, Matplotlib included",
      version: "3.11.8",
    },
    { value: "python-312", label: "Python 3.12", description: "Latest Python runtime", version: "3.12.2" },
    {
      value: "python-312-ds",
      label: "Python 3.12 for data science",
      description: "NumPy, Pandas, Matplotlib included",
      version: "3.12.2",
    },
    { value: "python-39", label: "Python 3.9", description: "Legacy Python runtime", version: "3.9.18" },
    {
      value: "python-39-ds",
      label: "Python 3.9 for data science",
      description: "NumPy, Pandas, Matplotlib included",
      version: "3.9.18",
    },
    { value: "r-40", label: "R 4.0", description: "Statistical computing environment", version: "4.0.5" },
  ]

  const shutdownOptions = [
    { value: "15min", label: "After 15 minutes of inactivity" },
    { value: "1hour", label: "After 1 hour of inactivity" },
    { value: "3hours", label: "After 3 hours of inactivity" },
    { value: "6hours", label: "After 6 hours of inactivity" },
    { value: "24hours", label: "After 24 hours of inactivity" },
  ]

  return (
    <>
      <div className="fixed left-0 top-0 w-2 h-full z-30 lg:block hidden" onMouseEnter={handleMouseEnter} />

      <div
        className={`fixed inset-0 z-40 lg:relative lg:inset-auto transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Overlay for mobile */}
        <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={onClose} />

        <div
          className={`absolute left-0 top-0 h-full bg-[#0f0f0f] border-r border-white/5 flex flex-col lg:relative transition-all duration-300 ease-in-out overflow-hidden`}
          style={{
            width: isOpen ? `${width}px` : "48px",
            minWidth: isOpen ? "200px" : "48px",
            maxWidth: isOpen ? "600px" : "48px",
          }}
        >
          <div
            className={`flex items-center justify-between border-b border-white/5 transition-all duration-300 ${
              isOpen ? "p-4" : "p-2"
            }`}
          >
            {isOpen ? (
              <>
                <h2 className="text-sm font-medium text-white/90">Workspace</h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="hidden lg:flex text-white/60 hover:text-white hover:bg-white/5"
                    title="Collapse Sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="lg:hidden text-white/60 hover:text-white hover:bg-white/5"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden lg:flex flex-col items-center gap-2 w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="text-white/60 hover:text-white hover:bg-white/5 p-1"
                  title="Expand Sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {isOpen && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ width: `${width - 32}px` }}>
              {/* Notebooks Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <BookOpen className="h-4 w-4 text-white/60 flex-shrink-0" />
                    <span className="text-sm font-medium text-white/80 truncate">Notebooks</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/5 flex-shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="ml-6 space-y-1">
                  <div className="text-xs text-white/60 py-1 px-2 rounded hover:bg-white/5 cursor-pointer truncate">
                    Untitled Notebook
                  </div>
                </div>
              </div>

              {/* Machine Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Cpu className="h-4 w-4 text-white/60 flex-shrink-0" />
                  <span className="text-sm font-medium text-white/80 truncate">Machine</span>
                </div>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger className="text-white hover:bg-black/50 text-xs w-full border-transparent border-dashed bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10" onCloseAutoFocus={(e) => e.preventDefault()}>
                    {machineOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white/80 focus:bg-white/10 focus:text-white"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{option.label}</span>
                            {option.internet && <Globe className="h-3 w-3 text-green-400" />}
                          </div>
                          <div className="text-xs text-white/60">{option.specs}</div>
                          <div className="text-xs text-white/40">{option.price}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Environment Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="h-4 w-4 text-white/60 flex-shrink-0" />
                  <span className="text-sm font-medium text-white/80 truncate">Environment</span>
                </div>
                <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                  <SelectTrigger className="text-white hover:bg-black/50 text-xs w-full bg-transparent border-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10" onCloseAutoFocus={(e) => e.preventDefault()}>
                    {environmentOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white/80 focus:bg-white/10 focus:text-white"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-white/60">{option.description}</div>
                          <div className="text-xs text-white/40">{option.version}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {!isOpen && (
            <div className="hidden lg:flex flex-col items-center gap-4 p-2 flex-1">
              <div className="p-2 rounded hover:bg-white/5 cursor-pointer" title="Notebooks">
                <BookOpen className="h-4 w-4 text-white/60" />
              </div>
            </div>
          )}

          {isOpen && (
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <button
                  onClick={toggleMachine}
                  className={`flex-1 group relative overflow-hidden rounded-lg border transition-all duration-300 ease-in-out ${
                    machineRunning
                      ? "bg-red-500/10 hover:bg-red-500/20 text-white border-red-500/30 hover:border-red-500/50"
                      : "bg-green-500/10 hover:bg-green-500/20 text-white border-green-500/30 hover:border-green-500/50"
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-center py-3 px-4">
                    <div
                      className={`flex items-center justify-center w-5 h-5 rounded-full mr-3 transition-all duration-300 ${
                        machineRunning ? "bg-red-500/30 text-red-300" : "bg-green-500/30 text-green-300"
                      }`}
                    >
                      <Power
                        className={`h-3 w-3 transition-all duration-300 ${
                          machineRunning ? "rotate-180 scale-110" : "rotate-0 scale-100"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium tracking-wide text-white">
                      {machineRunning ? "Stop Machine" : "Start Machine"}
                    </span>
                  </div>

                  {/* Subtle gradient overlay on hover */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform"
                    style={{ transition: "transform 0.6s ease-in-out, opacity 0.3s ease-in-out" }}
                  />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowShutdownMenu(!showShutdownMenu)}
                    className="h-full px-3 rounded-lg border border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all duration-200 backdrop-blur-sm"
                    title="Automatic shutdown settings"
                  >
                    <Clock className="h-4 w-4" />
                  </button>

                  {showShutdownMenu && (
                    <div
                      className="absolute bottom-full right-0 mb-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl backdrop-blur-sm z-50"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-white/60" />
                          <span className="text-sm font-medium text-white/80">Automatic shutdown</span>
                        </div>
                        <div className="text-xs text-white/60 mb-3">
                          To save on your machine costs or free quota, Deepnote automatically shuts down inactive
                          machines.
                        </div>
                        <div className="space-y-2">
                          {shutdownOptions.map((option) => (
                            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="shutdown"
                                value={option.value}
                                checked={selectedShutdown === option.value}
                                onChange={(e) => setSelectedShutdown(e.target.value)}
                                className="w-3 h-3 text-blue-500 bg-transparent border-white/30 focus:ring-blue-500 focus:ring-1"
                              />
                              <span className="text-xs text-white/80">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isOpen && (
            <div
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-white/10 transition-colors duration-200 z-50"
              onMouseDown={onResizeStart}
              style={{
                background: isResizing ? "rgba(255, 255, 255, 0.2)" : "transparent",
              }}
            >
              <div className="absolute top-1/2 right-0 w-1 h-8 bg-white/20 rounded-l transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
