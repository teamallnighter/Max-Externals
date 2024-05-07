import React from 'react';
import { ChartJSBarChart } from './BarChart/ChartJSBarChart';
import { ApexBarChart } from './BarChart/ApexBarChart';
import { WidgetLibName } from '../models/widget.model';

export const BarChart = ({ widget }) => {
  return (
    <>
      {!widget.lib_name && <ChartJSBarChart widget={widget} />}
      {widget.lib_name === WidgetLibName.chartjs && (
        <ChartJSBarChart widget={widget} />
      )}
      {widget.lib_name === WidgetLibName.apex && (
        <ApexBarChart widget={widget} />
      )}
    </>
  );
};
