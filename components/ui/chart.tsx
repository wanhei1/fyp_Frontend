import * as React from "react"

const ChartStyle = {
  root: "flex flex-col",
  container: "relative",
  tooltip: "absolute z-10 rounded-md border bg-popover p-2 shadow-md",
  tooltipContent: "text-sm text-muted-foreground",
  legend: "flex items-center justify-center pt-2",
  legendContent: "text-sm text-muted-foreground",
}

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(({ className, ...props }, ref) => {
  return <div className={ChartStyle.root + " " + (className || "")} ref={ref} {...props} />
})
Chart.displayName = "Chart"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(({ className, ...props }, ref) => {
  return <div className={ChartStyle.container + " " + (className || "")} ref={ref} {...props} />
})
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(({ className, ...props }, ref) => {
  return <div className={ChartStyle.tooltip + " " + (className || "")} ref={ref} {...props} />
})
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const ChartTooltipContent = React.forwardRef<HTMLParagraphElement, ChartTooltipContentProps>(
  ({ className, ...props }, ref) => {
    return <p className={ChartStyle.tooltipContent + " " + (className || "")} ref={ref} {...props} />
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

interface ChartLegendProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartLegend = React.forwardRef<HTMLDivElement, ChartLegendProps>(({ className, ...props }, ref) => {
  return <div className={ChartStyle.legend + " " + (className || "")} ref={ref} {...props} />
})
ChartLegend.displayName = "ChartLegend"

interface ChartLegendContentProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const ChartLegendContent = React.forwardRef<HTMLParagraphElement, ChartLegendContentProps>(
  ({ className, ...props }, ref) => {
    return <p className={ChartStyle.legendContent + " " + (className || "")} ref={ref} {...props} />
  },
)
ChartLegendContent.displayName = "ChartLegendContent"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }
