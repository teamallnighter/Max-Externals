/* eslint-disable @next/next/no-img-element */
// Why disabled:
// avatars.dicebear.com provides svg avatars
// next/image needs dangerouslyAllowSVG option for that

import React, { ReactNode } from 'react';
import { mdiImageOutline } from '@mdi/js';
import BaseIcon from './BaseIcon';

type Props = {
  name: string;
  image?: object | null;
  api?: string;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
};

export default function ImageField({
  name,
  image,
  className = '',
  imageClassName = '',
  children,
}: Props) {
  const imageSrc = image && image[0] ? `${image[0].publicUrl}` : '';

  return (
    <div className={className}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name}
          className={`rounded-full block h-auto w-full max-w-full bg-gray-100 dark:bg-dark-900 ${imageClassName}`}
        />
      ) : (
        <div className={'flex h-full bg-slate-100 dark:bg-dark-900/70'}>
          <BaseIcon
            className='text-black dark:text-white'
            w='w-full'
            h='h-full'
            size={54}
            path={mdiImageOutline}
          />
        </div>
      )}

      {children}
    </div>
  );
}
