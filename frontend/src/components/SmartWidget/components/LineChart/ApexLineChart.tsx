import React from 'react';
import dynamic from 'next/dynamic';
import { humanize } from '../../../../helpers/humanize';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
type ValueType = { [key: string]: string | number }[];

export const ApexLineChart = ({ widget }) => {
  const dataForLineChart = (value: any[]) => {
    if (!value?.length || value?.length > 10000)
      return [{ name: '', data: [] }];

    const valueKey = Object.keys(value[0])[1];
    const data = value.map((el) => +el[valueKey]);

    return [{ name: humanize(valueKey), data }];
  };

  const optionsForLineChart = (
    value: ValueType,
    chartColor: string[],
    currency: boolean,
  ) => {
    const chartColors = Array.isArray(chartColor)
      ? chartColor
      : [chartColor || '#3751FF'];
    const defaultOptions = {
      xaxis: {},
      chart: {
        toolbar: {
          show: true,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
          },
          export: {
            csv: {
              filename: undefined,
              columnDelimiter: ',',
              headerCategory: 'category',
              headerValue: 'value',
            },
            svg: {
              filename: undefined,
            },
            png: {
              filename: undefined,
            },
          },
        },
      },
      plotOptions: {
        bar: {
          distributed: false,
        },
      },
      colors: [],
    };

    if (!value?.length || value?.length > 10000) return defaultOptions;

    const key = Object.keys(value[0])[0];
    const categories = value
      .map((el) => el[key])
      .map((item) =>
        typeof item === 'string' && item?.length > 7
          ? item?.slice(0, 7)
          : item || '',
      );

    if (categories.length <= 3) {
      defaultOptions.plotOptions = {
        bar: {
          distributed: true,
        },
      };
    }

    const colors = [];
    for (let i = 0; i < categories.length; i++) {
      colors.push(chartColors[i % chartColors.length]);
    }

    return {
      ...defaultOptions,
      yaxis: {
        labels: {
          formatter: function (value) {
            if (currency) {
              return '$' + value;
            } else {
              return value;
            }
          },
        },
      },
      dataLabels: {
        formatter: (val) => {
          if (currency) {
            return '$' + val;
          } else {
            return val;
          }
        },
      },
      legend: {
        show: false,
      },
      xaxis: {
        categories,
      },
      colors,
    };
  };

  return (
    <Chart
      options={optionsForLineChart(
        widget.value,
        widget.color_array,
        widget.currency,
      )}
      series={dataForLineChart(widget.value)}
      type={widget.chart_type}
      height={200}
      style={{ width: '100%' }}
    />
  );
};
