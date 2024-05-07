import React from 'react';
import dynamic from 'next/dynamic';
import chroma from 'chroma-js';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
type ValueType = { [key: string]: string | number }[];

export const ApexPieChart = ({ widget }) => {
  const optionsForPieChart = (value: ValueType, chartColor: string) => {
    const chartColors = Array.isArray(chartColor)
      ? chartColor
      : [chartColor || '#3751FF'];
    const defaultOptions = {
      xaxis: {},
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
          customIcons: [],
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
        autoSelected: 'zoom',
      },
      colors: [],
    };

    if (!value?.length || value?.length > 10000) return defaultOptions;

    if (
      !isNaN(Number(value[0][Object.keys(value[0])[1]])) &&
      isFinite(Number(value[0][Object.keys(value[0])[1]]))
    ) {
      const labels = value
        .map((el) => String(el[Object.keys(value[0])[0]]))
        .reverse();

      let colors: string[] | (string & any[]);
      if (labels.length > chartColors.length) {
        colors = chroma
          .scale([
            chroma(chartColors.at(0)).brighten(),
            chroma(chartColors.at(-1)).darken(),
          ])
          .colors(labels.length);
      } else {
        colors = chartColors;
      }

      return {
        ...defaultOptions,
        colors,
        labels,
      };
    }
    const key = Object.keys(value[0])[1];
    const categories = value.map((el) => String(el[key])).reverse();

    return {
      ...defaultOptions,
      labels: categories,
    };
  };
  const dataForPieChart = (value: any[]) => {
    if (!value?.length || value?.length > 10000)
      return [{ name: '', data: [] }];

    if (
      !isNaN(parseFloat(value[0][Object.keys(value[0])[1]])) &&
      isFinite(value[0][Object.keys(value[0])[1]])
    ) {
      return value.map((el) => +el[Object.keys(value[0])[1]]).reverse();
    }
    const valueKey = Object.keys(value[0])[0];
    return value.map((el) => +el[valueKey]).reverse();
  };

  return (
    <Chart
      options={optionsForPieChart(widget.value, widget.color_array)}
      series={dataForPieChart(widget.value)}
      type={widget.chart_type}
      height={200}
      style={{ width: '100%' }}
    />
  );
};
