import React from 'react';
import { humanize } from '../../../../helpers/humanize';
import { Line } from 'react-chartjs-2';
import chroma from 'chroma-js';
import { collectOtherData, findFirstNumericKey } from '../../widgetHelpers';
import { Widget } from '../../models/widget.model';
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  CategoryScale,
  Tooltip,
  ChartData,
} from 'chart.js';

Chart.register(
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  CategoryScale,
  Tooltip,
);

interface Props {
  widget: Widget;
}

export const ChartJSLineChart = (props: Props) => {
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
      data={dataForBarChart(props.widget.value, props.widget.color_array)}
      options={options}
      height={350}
    />
  );
};
