import { EventType, useRive } from "@rive-app/react-canvas";
import { useEffect, useState } from "react";
import { useCreateRecord } from "../../hooks/queryClient";

const RiveMailingList = () => {
  const backendRoutePrefix = 'http://localhost:5000';
  const stateMachineName = 'MainSM';
  const [inputFocused, setInputFocused] = useState(false);
  const [pressedKeys, setPressedKeys] = useState('');
  const { mutateAsync, isSuccess, isError } = useCreateRecord();
  const { rive, RiveComponent } = useRive({
    src: 'mailing_list_signup.riv',
    stateMachines: stateMachineName,
    automaticallyHandleEvents: true,
    autoplay: true
  })
  const onRiveEventReceived = (riveEvent) => {
    const eventData = riveEvent.data;
    switch (eventData.name) {
      case "inputClick":
        setInputFocused(true);
        break;
      case "submitClick":
        console.log('submit is clicked', pressedKeys);
        rive.setTextRunValue("txtMailBtn", 'Saving...');
        let text = rive.getTextRunValue("txtMailInput");
        text = text.replace('|', '');
        mutateAsync({ apiRoute: `${backendRoutePrefix}/signup`, data: { email: text } }).then((resp) => {
          console.log(resp, 'resp');
          rive.setTextRunValue("txtMailBtn", 'Submit');
          rive.setTextRunValue("txtMailMsg", 'User created. Please verify your Email.');
        }).catch((err) => {
          console.log(err?.message, 'error');
          rive.setTextRunValue("txtMailBtn", 'Submit');
          rive.setTextRunValue("txtMailMsg", err?.message);
        })
        break;
      default:
        console.log('over all clicked');
        break;
    }
  }
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      // Allow only alphabets (a-z, A-Z), numbers (0-9), @, and .
      const allowedKeys = /^[a-zA-Z0-9@.]$/;
      if (key === 'Backspace') {
        setPressedKeys((prevKeys) => prevKeys.slice(0, -1));
      } else if (key === 'Enter') {
        // Do something else when Enter is pressed
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
    if (inputFocused) {
      rive.setTextRunValue("txtMailInput", pressedKeys + '|');
    }
  }, [pressedKeys])

  useEffect(() => {
    if (rive) {
      rive.on(EventType.RiveEvent, onRiveEventReceived);
      rive.setTextRunValue("txtMailInput", "|");
    }
  }, [rive]);
  return <RiveComponent />;
}

export default RiveMailingList;