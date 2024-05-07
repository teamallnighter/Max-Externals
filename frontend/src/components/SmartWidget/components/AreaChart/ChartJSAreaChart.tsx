import React from 'react';
import { Line } from 'react-chartjs-2';
import chroma from 'chroma-js';
import { humanize } from '../../../../helpers/humanize';
import { collectOtherData, findFirstNumericKey } from '../../widgetHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

export const ChartJSAreaChart = ({ widget }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        display: true,
      },
      x: {
        display: true,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  const dataForBarChart = (
    value: any[],
    chartColors: string[],
  ): ChartData<'line', number[], string> => {
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
    <Line
      data={dataForBarChart(widget.value, widget.color_array)}
      options={options}
      height={350}
    />
  );
};
