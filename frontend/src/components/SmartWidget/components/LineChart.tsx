import React from 'react';
import { WidgetLibName } from '../models/widget.model';
import { ApexLineChart } from './LineChart/ApexLineChart';
import { ChartJSLineChart } from './LineChart/ChartJSLineChart';

export const LineChart = ({ widget }) => {
  return (
    <>
      {!widget.lib_name && <ChartJSLineChart widget={widget} />}
      {widget.lib_name === WidgetLibName.chartjs && (
        <ChartJSLineChart widget={widget} />
      )}
      {widget.lib_name === WidgetLibName.apex && (
        <ApexLineChart widget={widget} />
      )}
    </>
  );
};
