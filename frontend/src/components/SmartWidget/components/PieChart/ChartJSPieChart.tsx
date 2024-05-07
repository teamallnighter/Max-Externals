import React from 'react';
import { humanize } from '../../../../helpers/humanize';
import { Pie } from 'react-chartjs-2';
import chroma from 'chroma-js';
import { collectOtherData, findFirstNumericKey } from '../../widgetHelpers';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const ChartJSPieChart = ({ widget }) => {
  const options = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        title: {
          display: true,
          text: widget.label,
        },
      },
    };
  };

  const dataForBarChart = (
    value: any[],
    chartColors: string[],
  ): ChartData<'pie', number[], string> => {
    if (!value?.length) return { labels: [''], datasets: [{ data: [] }] };
    const initColors = Array.isArray(chartColors)
      ? chartColors
      : [chartColors || '#3751FF'];

    const valueKey = findFirstNumericKey(value[0]);
    const label = humanize(valueKey);
    const data = value.map((el) => +el[valueKey]);
    const labels = value.map((el) =>
      Object.keys(el).length <= 2
        ? humanize(String(el[Object.keys(el)[0]]))
        : collectOtherData(el, valueKey),
    );

    const backgroundColor =
      labels.length > initColors.length
        ? chroma
            .scale([
              chroma(initColors[0]).brighten(),
              chroma(initColors.slice(-1)[0]).darken(),
            ])
            .colors(labels.length)
        : initColors;

    return {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor,
        },
      ],
    };
  };

  return (
    <Pie
      data={dataForBarChart(widget.value, widget.color_array)}
      options={options()}
      height={350}
    />
  );
};
