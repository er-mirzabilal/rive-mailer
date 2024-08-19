import { EventType, useRive } from "@rive-app/react-canvas";
import { useEffect, useState, useRef } from "react";
import { useCreateRecord, useDeleteRecord, useUpdateRecord } from "../../hooks/queryClient";
const backendRoutePrefix = 'http://localhost:5000';
const defaultInputPlaceHolder = 'EMAILADDRESS@DOMAIN.COM';
const stateMachineName = 'MainSM';
const handleRecordCreate = (pressedKeysRef, inputFocusedRef, createRecord, rive) => {
  let text = pressedKeysRef.current; // Use the ref value here
  console.log('submit is clicked', inputFocusedRef.current, text);
  if (inputFocusedRef.current && text?.length) {
    rive.setTextRunValue("txtMailBtn", 'Saving...');
    createRecord({ apiRoute: `${backendRoutePrefix}/signup`, data: { email: text } })
      .then((resp) => {
        console.log(resp, 'resp');
        rive.setTextRunValue("txtMailBtn", 'Submit');
        if (resp && resp?.status === 'email-found-and-not-verified') {
          const stateMachineInput = rive.stateMachineInputs(stateMachineName).find(input => input.name === "isExistAndNotVerified");
          if (stateMachineInput) {
            stateMachineInput.value = true;
            rive.setTextRunValue("txtMailInput", "Email Already Found But Not Verified!  Do you wish to resend the verification request or remove your email from our system?");
          }
        } else if (resp && resp?.status === 'email-found-and-verified') {
          const stateMachineInput = rive.stateMachineInputs(stateMachineName).find(input => input.name === "isExistAndVerifiedState");
          if (stateMachineInput) {
            stateMachineInput.value = true;
            rive.setTextRunValue("txtMailInput", "Email Already Found!  Do you wish to remove your email from our mailing list system?");
          }
        }
        else if (resp && resp?.status === 'record-save') {
          rive.setTextRunValue("txtMailMsg", 'Thank you for your Submission; please check your email to Verify your Registration.');
          rive.setTextRunValue("txtMailInput", defaultInputPlaceHolder);
          pressedKeysRef.current = '';
        }
      })
      .catch((err) => {
        console.log(err?.message, 'error');
        rive.setTextRunValue("txtMailBtn", 'Submit');
        rive.setTextRunValue("txtMailMsg", err?.message);
      });
  }
}

const handleRemoveRecord = (pressedKeysRef, removeRecord, rive, verified) => {
  let text = pressedKeysRef.current;
  console.log('text pressed', pressedKeysRef.current);
  if (text && text?.length) {
    console.log('text', text);
    if (verified) {
      rive.setTextRunValue("btnYesSubmit", 'Removing...');
    } else {
      rive.setTextRunValue("btnRemoveSubmit", 'Removing...');
    }
    removeRecord({ apiRoute: `${backendRoutePrefix}/remove-record/${text}`, data: { email: text } })
      .then((resp) => {
        console.log(resp, 'resp');
        if (verified) {
          rive.setTextRunValue("btnYesSubmit", 'Yes');
        } else {
          rive.setTextRunValue("btnRemoveSubmit", 'Remove');
        }
        const stateMachineInput = rive.stateMachineInputs(stateMachineName).find(input => input.name === (verified ? "isExistAndVerifiedState" : "isExistAndNotVerified"));
        if (stateMachineInput) {
          stateMachineInput.value = false;
          rive.setTextRunValue("txtMailMsg", '');
          rive.setTextRunValue("txtMailInput", defaultInputPlaceHolder);
        }
      })
      .catch((err) => {
        console.log(err?.message, 'error');
        if (verified) {
          rive.setTextRunValue("btnYesSubmit", 'Yes');
        } else {
          rive.setTextRunValue("btnRemoveSubmit", 'Remove');
        }
        rive.setTextRunValue("txtMailMsg", err?.message);
      });
  }
}

const handleResend = (pressedKeysRef, updateRecord, rive) => {
  let text = pressedKeysRef.current;
  if (text && text?.length) {
    rive.setTextRunValue("btnResendSubmit", 'Resending...');
    updateRecord({ apiRoute: `${backendRoutePrefix}/resend-email/`, data: { email: text } })
      .then((resp) => {
        console.log(resp, 'resp');
        rive.setTextRunValue("btnResendSubmit", 'Resend');
        const stateMachineInput = rive.stateMachineInputs(stateMachineName).find(input => input.name === "isExistAndNotVerified");
        if (stateMachineInput) {
          stateMachineInput.value = false;
          rive.setTextRunValue("txtMailMsg", '');
          rive.setTextRunValue("txtMailInput", defaultInputPlaceHolder);
        }
      })
      .catch((err) => {
        console.log(err?.message, 'error');
        rive.setTextRunValue("btnResendSubmit", 'Resend');
        rive.setTextRunValue("txtMailMsg", err?.message);
      });
  }
}

const handleCancel = (rive) => {
  const stateMachineInput = rive.stateMachineInputs(stateMachineName).find(input => input.name === "isExistAndVerifiedState");
  if (stateMachineInput) {
    stateMachineInput.value = false;
    rive.setTextRunValue("txtMailMsg", '');
    rive.setTextRunValue("txtMailInput", defaultInputPlaceHolder);
  }
}


const RiveMailingList = () => {

  const inputFocusedRef = useRef(false); // Ref for input focused state
  const pressedKeysRef = useRef(''); // Ref for pressed keys state

  const [pressedKeys, setPressedKeys] = useState('');

  const { mutateAsync: createRecord } = useCreateRecord();
  const { mutateAsync: removeRecord } = useDeleteRecord();
  const { mutateAsync: updateRecord } = useUpdateRecord();
  const { rive, RiveComponent } = useRive({
    src: 'mailing_list_signup_5.riv',
    stateMachines: stateMachineName,
    automaticallyHandleEvents: true,
    autoplay: true,
  });

  const onRiveEventReceived = (riveEvent) => {
    const eventData = riveEvent.data;
    switch (eventData.name) {
      case "txtFiedMouseDown":
        console.log('input is clicked');
        inputFocusedRef.current = true;
        break;
      case "btnSubmitClick":
        handleRecordCreate(pressedKeysRef, inputFocusedRef, createRecord, rive);
        inputFocusedRef.current = false;
        break;
      case "btnRemoveSubmit":
        console.log('remove button clicked');
        handleRemoveRecord(pressedKeysRef, removeRecord, rive, false);
        break;
      case "btnResendSubmit":
        handleResend(pressedKeysRef, updateRecord, rive);
        break;
      case "btnYesSubmit":
        handleRemoveRecord(pressedKeysRef, removeRecord, rive, true);
        break;
      case "btnNoSubmit":
        handleCancel(rive);
        break;
      default:
        console.log('over all clicked');
        break;
    }
  };

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
      console.log(pressedKeys, 'pressed', inputFocusedRef.current);
      requestAnimationFrame(() => {
        rive.setTextRunValue("txtMailInput", pressedKeys + '|');
      });
    }
  }, [pressedKeys, rive]); // Add rive as a dependency

  useEffect(() => {
    if (rive) {
      rive.on(EventType.RiveEvent, onRiveEventReceived);
    }
  }, [rive]);

  return <RiveComponent />;
};

export default RiveMailingList;
