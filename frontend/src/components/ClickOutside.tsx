import React, { useCallback, useEffect, useRef } from 'react';

const ClickOutside = ({ children, onClickOutside, excludedElements }) => {
  const wrapperRef = useRef(null);

  const handleClickOutside = useCallback(
    (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !excludedElements.some((el) => el.current.contains(event.target))
      ) {
        onClickOutside();
      }
    },
    [wrapperRef, onClickOutside, ...excludedElements],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return <div ref={wrapperRef}>{children}</div>;
};

export default ClickOutside;
