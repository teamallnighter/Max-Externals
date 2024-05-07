import { mdiChartTimelineVariant, mdiUpload } from '@mdi/js';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import CardBox from '../../components/CardBox';
import LayoutAuthenticated from '../../layouts/Authenticated';
import SectionMain from '../../components/SectionMain';
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton';
import { getPageTitle } from '../../config';

import { Field, Form, Formik } from 'formik';
import FormField from '../../components/FormField';
import BaseDivider from '../../components/BaseDivider';
import BaseButtons from '../../components/BaseButtons';
import BaseButton from '../../components/BaseButton';
import FormCheckRadio from '../../components/FormCheckRadio';
import FormCheckRadioGroup from '../../components/FormCheckRadioGroup';
import FormFilePicker from '../../components/FormFilePicker';
import FormImagePicker from '../../components/FormImagePicker';
import { SelectField } from '../../components/SelectField';
import { SelectFieldMany } from '../../components/SelectFieldMany';
import { SwitchField } from '../../components/SwitchField';
import { RichTextField } from '../../components/RichTextField';

import { update, fetch } from '../../stores/devices/devicesSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';

const EditDevices = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const initVals = {
    title: '',

    price: '',

    description: '',

    images: [],

    studio: '',

    category: '',

    is_free: false,
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { devices } = useAppSelector((state) => state.devices);

  const { devicesId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: devicesId }));
  }, [devicesId]);

  useEffect(() => {
    if (typeof devices === 'object') {
      setInitialValues(devices);
    }
  }, [devices]);

  useEffect(() => {
    if (typeof devices === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach(
        (el) => (newInitialVal[el] = devices[el] || ''),
      );

      setInitialValues(newInitialVal);
    }
  }, [devices]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: devicesId, data }));
    await router.push('/devices/devices-list');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit devices')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={'Edit devices'}
          main
        >
          {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form>
              <FormField label='Title'>
                <Field name='title' placeholder='Title' />
              </FormField>

              <FormField label='Price'>
                <Field type='number' name='price' placeholder='Price' />
              </FormField>

              <FormField label='Description' hasTextareaHeight>
                <Field
                  name='description'
                  id='description'
                  component={RichTextField}
                ></Field>
              </FormField>

              <FormField>
                <Field
                  label='Images'
                  color='info'
                  icon={mdiUpload}
                  path={'devices/images'}
                  name='images'
                  id='images'
                  schema={{
                    size: undefined,
                    formats: undefined,
                  }}
                  component={FormImagePicker}
                ></Field>
              </FormField>

              <FormField label='Studio' labelFor='studio'>
                <Field
                  name='studio'
                  id='studio'
                  component={SelectField}
                  options={initialValues.studio}
                  itemRef={'studios'}
                  showField={'name'}
                ></Field>
              </FormField>

              <FormField label='Category' labelFor='category'>
                <Field name='Category' id='Category' component='select'>
                  <option value='max_msp_externals'>max_msp_externals</option>

                  <option value='max_for_live_devices'>
                    max_for_live_devices
                  </option>
                </Field>
              </FormField>

              <FormField label='Free Download' labelFor='is_free'>
                <Field
                  name='is_free'
                  id='is_free'
                  component={SwitchField}
                ></Field>
              </FormField>

              <BaseDivider />
              <BaseButtons>
                <BaseButton type='submit' color='info' label='Submit' />
                <BaseButton type='reset' color='info' outline label='Reset' />
                <BaseButton
                  type='reset'
                  color='danger'
                  outline
                  label='Cancel'
                  onClick={() => router.push('/devices/devices-list')}
                />
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

EditDevices.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'UPDATE_DEVICES'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default EditDevices;
