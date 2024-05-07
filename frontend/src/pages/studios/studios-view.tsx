import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { fetch } from '../../stores/studios/studiosSlice';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';
import LayoutAuthenticated from '../../layouts/Authenticated';
import { getPageTitle } from '../../config';
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton';
import SectionMain from '../../components/SectionMain';
import CardBox from '../../components/CardBox';
import BaseButton from '../../components/BaseButton';
import BaseDivider from '../../components/BaseDivider';
import { mdiChartTimelineVariant } from '@mdi/js';
import { SwitchField } from '../../components/SwitchField';
import FormField from '../../components/FormField';

const StudiosView = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { studios } = useAppSelector((state) => state.studios);

  const { id } = router.query;

  function removeLastCharacter(str) {
    console.log(str, `str`);
    return str.slice(0, -1);
  }

  useEffect(() => {
    dispatch(fetch({ id }));
  }, [dispatch, id]);

  return (
    <>
      <Head>
        <title>{getPageTitle('View studios')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={removeLastCharacter('View studios')}
          main
        >
          {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>StudioName</p>
            <p>{studios?.name}</p>
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Description</p>
            {studios.description ? (
              <p dangerouslySetInnerHTML={{ __html: studios.description }} />
            ) : (
              <p>No data</p>
            )}
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Owner</p>

            <p>{studios?.owner?.firstName ?? 'No data'}</p>
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>External website</p>
            <p>{studios?.externalwebsite}</p>
          </div>

          <>
            <p className={'block font-bold mb-2'}>Devices Studio</p>
            <CardBox
              className='mb-6 border border-gray-300 rounded overflow-hidden'
              hasTable
            >
              <div className='overflow-x-auto'>
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>

                      <th>Price</th>

                      <th>Category</th>

                      <th>Free Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studios.devices_studio &&
                      Array.isArray(studios.devices_studio) &&
                      studios.devices_studio.map((item: any) => (
                        <tr
                          key={item.id}
                          onClick={() =>
                            router.push(`/devices/devices-view/?id=${item.id}`)
                          }
                        >
                          <td data-label='title'>{item.title}</td>

                          <td data-label='price'>{item.price}</td>

                          <td data-label='category'>{item.category}</td>

                          <td data-label='is_free'>
                            {dataFormatter.booleanFormatter(item.is_free)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!studios?.devices_studio?.length && (
                <div className={'text-center py-4'}>No data</div>
              )}
            </CardBox>
          </>

          <BaseDivider />

          <BaseButton
            color='info'
            label='Back'
            onClick={() => router.push('/studios/studios-list')}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

StudiosView.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'READ_STUDIOS'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default StudiosView;
