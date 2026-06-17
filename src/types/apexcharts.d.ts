// apexcharts declares its types as global ambients but doesn't export them from the module.
// This augmentation makes `import type { ApexOptions, ... } from "apexcharts"` work.
declare module "apexcharts" {
    export type { ApexChart, ApexOptions, ApexAxisChartSeries, ApexNonAxisChartSeries, ApexAnnotations, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexMarkers, ApexNoData, ApexPlotOptions, ApexResponsive, ApexStates, ApexStroke, ApexTheme, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis };
}
