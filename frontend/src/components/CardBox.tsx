import React, { ReactNode } from 'react';
import CardBoxComponentBody from './CardBoxComponentBody';
import CardBoxComponentFooter from './CardBoxComponentFooter';

type Props = {
  rounded?: string;
  flex?: string;
  className?: string;
  hasComponentLayout?: boolean;
  hasTable?: boolean;
  isHoverable?: boolean;
  isModal?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
};

export default function CardBox({
  rounded = 'rounded',
  flex = 'flex-col',
  className = '',
  hasComponentLayout = false,
  hasTable = false,
  isHoverable = false,
  isModal = false,
  children,
  footer,
  onClick,
}: Props) {
  const componentClass = [
    'bg-white flex border border-pavitra-400 dark:border-dark-700 dark:bg-dark-900',
    className,
    rounded,
    flex,
    hasTable ? '' : 'border border-pavitra-400 dark:border-dark-700',
  ];

  if (isHoverable) {
    componentClass.push('hover:shadow-lg transition-shadow duration-500');
  }

  return React.createElement(
    'div',
    { className: componentClass.join(' '), onClick },
    hasComponentLayout ? (
      children
    ) : (
      <>
        <CardBoxComponentBody noPadding={hasTable}>
          {children}
        </CardBoxComponentBody>
        {footer && <CardBoxComponentFooter>{footer}</CardBoxComponentFooter>}
      </>
    ),
  );
}
