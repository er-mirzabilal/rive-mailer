import { useState, useEffect, useRef } from "react";

export const usePressedKeys = (rive, inputFocusedRef) => {
  const [pressedKeys, setPressedKeys] = useState('');
  const pressedKeysRef = useRef('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      const allowedKeys = /^[a-zA-Z0-9@.]$/;
      if (key === 'Backspace') {
        setPressedKeys((prevKeys) => prevKeys.slice(0, -1));
      } else if (key === 'Enter') {
        alert('Enter key was pressed!');
      } else if (allowedKeys.test(key)) {
        setPressedKeys((prevKeys) => prevKeys + key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (rive && inputFocusedRef.current) {
      pressedKeysRef.current = pressedKeys; // Keep the ref updated with the latest value of pressedKeys
      requestAnimationFrame(() => {
        rive.setTextRunValue("txtMailInput", pressedKeys + '|');
      });
    }
  }, [pressedKeys, rive]);

  return { pressedKeysRef };
};
