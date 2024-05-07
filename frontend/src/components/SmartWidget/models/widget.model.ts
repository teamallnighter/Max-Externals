export enum WidgetLibName {
  apex = 'apex',
  chartjs = 'chartjs',
}

export enum WidgetChartType {
  scalar = 'scalar',
  bar = 'bar',
  line = 'line',
  pie = 'pie',
  area = 'area',
  funnel = 'funnel',
}

export enum WidgetType {
  chart = 'chart',
  scalar = 'scalar',
}

export interface Widget {
  type: WidgetType;
  chartType: WidgetChartType;
  query: string;
  mdiIcon: string;
  iconColor: string;
  label: string;
  id: string;
  lib?: WidgetLibName;
  value: any[];
  chartColors: string[];
  options?: any;
  prompt: string;
  color: string;
  color_array: string[];
}
