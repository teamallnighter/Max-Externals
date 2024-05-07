import CardBox from '../CardBox';
import { mdiCog } from '@mdi/js';
import { Field, Form, Formik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import FormField from '../FormField';
import React from 'react';
import {
  aiPrompt,
  setErrorNotification,
  resetNotify,
} from '../../stores/openAiSlice';
import 'react-toastify/dist/ReactToastify.min.css';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';

import { fetchWidgets } from '../../stores/roles/rolesSlice';

import BaseButton from '../BaseButton';
import CardBoxModal from '../CardBoxModal';
import { RoleSelect } from './RoleSelect';

export const WidgetCreator = ({
  currentUser,
  isFetchingQuery,
  setWidgetsRole,
  widgetsRole,
}) => {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { notify: openAiNotify } = useAppSelector((state) => state.openAi);

  const notify = (type, msg) => toast(msg, { type, position: 'bottom-center' });
  React.useEffect(() => {
    if (openAiNotify.showNotification) {
      notify(openAiNotify.typeNotification, openAiNotify.textNotification);
      dispatch(resetNotify());
    }
  }, [openAiNotify.showNotification]);

  const openModal = (): void => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (value = {}) => {
    setWidgetsRole(value);
    setIsModalOpen(false);
  };

  const getWidgets = async () => {
    await dispatch(fetchWidgets(widgetsRole?.role?.value || ''));
  };

  const smartSearch = async (
    values: { description: string },
    resetForm: any,
  ) => {
    const description = values.description;
    const projectId = '23216';

    const payload = {
      roleId: widgetsRole?.role?.value,
      description,
      projectId,
      userId: currentUser?.id,
    };
    const { payload: responcePayload, error }: any = await dispatch(
      aiPrompt(payload),
    );

    await getWidgets().then();

    resetForm({ values: { description: '' } });
    if (responcePayload.data?.error || error) {
      const errorMessage =
        responcePayload.data?.error?.message || error?.message;
      await dispatch(
        setErrorNotification(errorMessage || 'Error with widget creation'),
      );
    }
  };

  return (
    <>
      <CardBox className='mb-6 relative'>
        <BaseButton
          className='absolute top-0 right-0 m-4'
          icon={mdiCog}
          color='whiteDark'
          roundedFull
          onClick={openModal}
        />
        <Formik
          initialValues={{
            description: '',
          }}
          onSubmit={(values, { resetForm }) => smartSearch(values, resetForm)}
        >
          <Form>
            <FormField
              label='Create Chart or Widget'
              help={
                isFetchingQuery
                  ? 'Loading...'
                  : 'Describe your new widget or chart in natural language. For example: "Number of admin users" OR "red chart with number of closed contracts grouped by month"'
              }
            >
              <Field
                type='input'
                name='description'
                disabled={isFetchingQuery}
              />
            </FormField>
          </Form>
        </Formik>
      </CardBox>
      <Formik
        initialValues={{
          role: '',
        }}
        onSubmit={(values) => handleCloseModal(values)}
      >
        {({ submitForm }) => (
          <CardBoxModal
            title='Widget Creator Settings'
            buttonColor='info'
            buttonLabel='Done'
            isActive={isModalOpen}
            onConfirm={submitForm}
            onCancel={() => setIsModalOpen(false)}
          >
            <p>What role are we showing and creating widgets for?</p>

            <Form>
              <FormField>
                <Field
                  name='role'
                  id='role'
                  component={RoleSelect}
                  options={widgetsRole?.role || []}
                  itemRef={'roles'}
                  currentUser={currentUser}
                ></Field>
              </FormField>
            </Form>
          </CardBoxModal>
        )}
      </Formik>
      <ToastContainer />
    </>
  );
};
