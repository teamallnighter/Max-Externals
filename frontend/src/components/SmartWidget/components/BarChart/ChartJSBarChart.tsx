import React from 'react';
import { humanize } from '../../../../helpers/humanize';
import { Bar } from 'react-chartjs-2';
import { collectOtherData, findFirstNumericKey } from '../../widgetHelpers';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import chroma from 'chroma-js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const ChartJSBarChart = ({ widget }) => {
  console.log(widget);
  const options = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
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
  ): ChartData<'bar', number[], string> => {
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
    <Bar
      data={dataForBarChart(widget.value, widget.color_array)}
      options={options()}
      height={350}
    />
  );
};
