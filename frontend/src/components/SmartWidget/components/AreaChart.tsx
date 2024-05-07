import React from 'react';
import { WidgetLibName } from '../models/widget.model';
import { ApexAreaChart } from './AreaChart/ApexAreaChart';
import { ChartJSAreaChart } from './AreaChart/ChartJSAreaChart';

export const AreaChart = ({ widget }) => {
  return (
    <>
      {!widget.lib_name && <ChartJSAreaChart widget={widget} />}
      {widget.lib_name === WidgetLibName.chartjs && (
        <ChartJSAreaChart widget={widget} />
      )}
      {widget.lib_name === WidgetLibName.apex && (
        <ApexAreaChart widget={widget} />
      )}
    </>
  );
};
