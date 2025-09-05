/**
 * Maps title size enum to className without inline styles
 */
export enum TitleSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  EXTRA_LARGE = "extraLarge",
}

export const titleSizeClassNames: Record<TitleSize, string> = {
  [TitleSize.SMALL]: "text-2xl font-semibold leading-tight",
  [TitleSize.MEDIUM]: "text-3xl font-bold leading-tight",
  [TitleSize.LARGE]: "text-4xl font-bold leading-none",
  [TitleSize.EXTRA_LARGE]: "text-5xl font-bold leading-none",
}

export function getTitleClassName(size: TitleSize): string {
  return titleSizeClassNames[size] || titleSizeClassNames[TitleSize.LARGE]
}
