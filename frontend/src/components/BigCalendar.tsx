import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Calendar,
  Views,
  momentLocalizer,
  SlotInfo,
  EventProps,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ListActionsPopover from './ListActionsPopover';

import { useAppSelector } from '../stores/hooks';
import { hasPermission } from '../helpers/userPermissions';

const localizer = momentLocalizer(moment);

type TEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
};

type Props = {
  events: any[];
  handleViewAction: (id: string) => void;
  handleEditAction: (id: string) => void;
  handleDeleteAction: (id: string) => void;
  handleCreateEventAction: (slotInfo: SlotInfo) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  entityName: string;
  showField: string;
  'start-data-key': string;
  'end-data-key': string;
};

const BigCalendar = ({
  events,
  handleViewAction,
  handleEditAction,
  handleDeleteAction,
  handleCreateEventAction,
  onDateRangeChange,
  entityName,
  showField,
  'start-data-key': startDataKey,
  'end-data-key': endDataKey,
}: Props) => {
  const [myEvents, setMyEvents] = useState<TEvent[]>([]);
  const prevRange = useRef<{ start: string; end: string }>();

  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const hasUpdatePermission =
    currentUser &&
    hasPermission(currentUser, `UPDATE_${entityName.toUpperCase()}`);
  const hasCreatePermission =
    currentUser &&
    hasPermission(currentUser, `CREATE_${entityName.toUpperCase()}`);

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    [],
  );

  useEffect(() => {
    if (!events || !Array.isArray(events) || !events?.length) return;

    const formattedEvents = events.map((event) => ({
      ...event,
      start: new Date(event[startDataKey]),
      end: new Date(event[endDataKey]),
      title: event[showField],
    }));

    setMyEvents(formattedEvents);
  }, [endDataKey, events, startDataKey, showField]);

  const onRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    const newRange = { start: '', end: '' };
    const format = 'YYYY-MM-DDTHH:mm';

    if (Array.isArray(range)) {
      newRange.start = moment(range[0]).format(format);
      newRange.end = moment(range[range.length - 1]).format(format);
    } else {
      newRange.start = moment(range.start).format(format);
      newRange.end = moment(range.end).format(format);
    }

    if (newRange.start === newRange.end) {
      newRange.end = moment(newRange.end).add(1, 'days').format(format);
    }

    // check if the range fits in the previous range
    if (
      prevRange.current &&
      prevRange.current.start <= newRange.start &&
      prevRange.current.end >= newRange.end
    ) {
      return;
    }

    prevRange.current = { start: newRange.start, end: newRange.end };
    onDateRangeChange(newRange);
  };

  return (
    <div className='h-[600px] p-4'>
      <Calendar
        defaultDate={defaultDate}
        defaultView={Views.MONTH}
        events={myEvents}
        localizer={localizer}
        selectable={hasCreatePermission}
        onSelectSlot={handleCreateEventAction}
        onRangeChange={onRangeChange}
        scrollToTime={scrollToTime}
        components={{
          event: (props) => (
            <MyCustomEvent
              {...props}
              onDelete={handleDeleteAction}
              onView={handleViewAction}
              onEdit={handleEditAction}
              hasUpdatePermission={hasUpdatePermission}
            />
          ),
        }}
      />
    </div>
  );
};

const MyCustomEvent = (
  props: {
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    hasUpdatePermission: boolean;
  } & EventProps<TEvent>,
) => {
  const { onEdit, onView, onDelete, hasUpdatePermission, title, event } = props;

  return (
    <div className={'flex items-center justify-between relative'}>
      <span
        className={'text-ellipsis overflow-hidden grow'}
        onClick={() => onView(event.id)}
      >
        {title}
      </span>
      <ListActionsPopover
        className={'w-2 h-2 text-white'}
        iconClassName={'text-white w-5'}
        itemId={event.id}
        onDelete={onDelete}
        onView={onView}
        onEdit={onEdit}
        hasUpdatePermission={hasUpdatePermission}
      />
    </div>
  );
};

export default BigCalendar;
