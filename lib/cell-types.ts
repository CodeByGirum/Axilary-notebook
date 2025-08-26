import type { CellType } from "@/types/notebook"

export const CELL_TYPE_CONFIG = {
  text: {
    label: "Text",
    description: "rich text",
    icon: "📝",
    color: "text-blue-400",
  },
  python: {
    label: "Python",
    description: "code + stdout",
    icon: "🐍",
    color: "text-green-400",
  },
  r: {
    label: "R",
    description: "code + console",
    icon: "📊",
    color: "text-purple-400",
  },
  sql: {
    label: "SQL",
    description: "query + resultset",
    icon: "🗃️",
    color: "text-orange-400",
  },
  chart: {
    label: "Chart",
    description: "visual output",
    icon: "📈",
    color: "text-cyan-400",
  },
  gpu: {
    label: "GPU",
    description: "jobs + logs",
    icon: "⚡",
    color: "text-yellow-400",
  },
  table: {
    label: "Table",
    description: "tabular data",
    icon: "📋",
    color: "text-pink-400",
  },
  params: {
    label: "Params",
    description: "hyperparameters",
    icon: "⚙️",
    color: "text-indigo-400",
  },
  prompt: {
    label: "Prompt",
    description: "AI request → updates all",
    icon: "🤖",
    color: "text-emerald-400",
  },
} as const satisfies Record<CellType, { label: string; description: string; icon: string; color: string }>
