import React, { useEffect, useId, useState } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';

export const RoleSelect = ({
  options,
  field,
  form,
  itemRef,
  disabled,
  currentUser,
}) => {
  const [value, setValue] = useState(null);

  React.useEffect(() => {
    if (currentUser.app_role.id) {
      setValue({
        value: currentUser.app_role.id,
        label: currentUser.app_role.name,
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (options?.value && options?.label) {
      setValue({ value: options.value, label: options.label });
    }
  }, [options?.id, field?.value?.id]);

  const mapResponseToValuesAndLabels = (data) => ({
    value: data.id,
    label: data.label,
  });
  const handleChange = (option) => {
    form.setFieldValue(field.name, option);
    setValue(option);
  };

  async function callApi() {
    const data = await axios(`/${itemRef}/autocomplete?limit=100`);
    return data.data.map(mapResponseToValuesAndLabels);
  }
  return (
    <AsyncSelect
      classNames={{
        control: () => 'px-1 py-2',
      }}
      classNamePrefix={'react-select'}
      instanceId={useId()}
      value={value}
      loadOptions={callApi}
      onChange={handleChange}
      defaultOptions
      isDisabled={disabled}
    />
  );
};
