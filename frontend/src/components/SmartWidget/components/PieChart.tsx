import React from 'react';
import { WidgetLibName } from '../models/widget.model';
import { ApexPieChart } from './PieChart/ApexPieChart';
import { ChartJSPieChart } from './PieChart/ChartJSPieChart';

export const PieChart = ({ widget }) => {
  return (
    <>
      {!widget.lib_name && <ChartJSPieChart widget={widget} />}
      {widget.lib_name === WidgetLibName.chartjs && (
        <ChartJSPieChart widget={widget} />
      )}
      {widget.lib_name === WidgetLibName.apex && (
        <ApexPieChart widget={widget} />
      )}
    </>
  );
};
