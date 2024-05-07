import React from 'react';
import BaseButton from '../BaseButton';
import BaseIcon from '../BaseIcon';
import * as icons from '@mdi/js';
import { useAppDispatch } from '../../stores/hooks';

import { fetchWidgets, removeWidget } from '../../stores/roles/rolesSlice';
import { WidgetChartType, WidgetType } from './models/widget.model';
import { BarChart } from './components/BarChart';
import { PieChart } from './components/PieChart';
import { AreaChart } from './components/AreaChart';
import { LineChart } from './components/LineChart';

export const SmartWidget = ({ widget, userId, admin, roleId }) => {
  const dispatch = useAppDispatch();

  const deleteWidget = async () => {
    await dispatch(
      removeWidget({ id: userId, widgetId: widget.widget_id, roleId }),
    );
    await dispatch(fetchWidgets(roleId));
  };

  return (
    <div
      className={`rounded dark:bg-dark-900 bg-white border border-pavitra-400 dark:border-dark-700 p-6 ${
        widget.widget_type === 'chart'
          ? 'col-span-2'
          : 'lg:col-span-1 col-span-2'
      }`}
    >
      <div className='flex justify-between flex-col h-full'>
        <div className='flex justify-between items-center'>
          <div className='text-lg leading-tight text-gray-500 dark:text-dark-600 line-clamp-2'>
            {widget.label}
          </div>

          {admin && (
            <BaseButton
              icon={icons.mdiClose}
              color='whiteDark'
              roundedFull
              onClick={deleteWidget}
            />
          )}
        </div>

        <div className='flex justify-center items-center h-full'>
          <div
            className={`${
              widget.widget_type === WidgetType.chart
                ? 'w-5/6 justify-center'
                : ''
            } items-center flex flex-grow justify-center`}
          >
            {widget.value ? (
              widget.widget_type === WidgetType.chart ? (
                widget.chart_type === WidgetChartType.bar ? (
                  <BarChart widget={widget} />
                ) : widget.chart_type === WidgetChartType.line ? (
                  <LineChart widget={widget} />
                ) : widget.chart_type === WidgetChartType.pie ? (
                  <PieChart widget={widget} />
                ) : widget.chart_type === WidgetChartType.area ? (
                  <AreaChart widget={widget} />
                ) : widget.chart_type === WidgetChartType.funnel ? (
                  <AreaChart widget={widget} />
                ) : null
              ) : (
                <div className='text-3xl leading-tight font-semibold truncate'>
                  {widget.value}
                </div>
              )
            ) : (
              <div className='text-center text-red-400'>
                Something went wrong, please try again or use a different query.
              </div>
            )}
          </div>

          {widget.type === WidgetType.scalar && widget.mdiIcon && (
            <div className='flex justify-end w-1/4'>
              <BaseIcon
                className='text-blue-500 flex-shrink-0'
                w='w-16'
                h='h-16'
                size={48}
                fill={widget.color}
                path={icons[widget.mdiIcon]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
