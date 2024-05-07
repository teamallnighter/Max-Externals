import React, { useEffect, useId, useState } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';

export const SelectFieldMany = ({
  options,
  field,
  form,
  itemRef,
  showField,
}) => {
  const [value, setValue] = useState([]);

  useEffect(() => {
    if (field.value?.[0] && typeof field.value[0] !== 'string') {
      form.setFieldValue(
        field.name,
        field.value.map((el) => el.id),
      );
    }
  }, [field.name, field.value, form]);

  useEffect(() => {
    if (options) {
      setValue(options.map((el) => ({ value: el.id, label: el[showField] })));
      form.setFieldValue(
        field.name,
        options.map((el) => ({ value: el.id, label: el[showField] })),
      );
    }
  }, [options]);

  const mapResponseToValuesAndLabels = (data) => ({
    value: data.id,
    label: data.label,
  });

  const handleChange = (data: any) => {
    setValue(data);
    form.setFieldValue(
      field.name,
      data.map((el) => el.value),
    );
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
      classNamePrefix='react-select'
      instanceId={useId()}
      value={value}
      isMulti
      loadOptions={callApi}
      onChange={handleChange}
      defaultOptions
    />
  );
};
