import { EventType, useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from "react";
import { useCreateRecord, useDeleteRecord, useUpdateRecord } from "../../hooks/queryClient";
import axios from 'axios';
const backendRoutePrefix = 'http://localhost:8000';
const defaultInputPlaceHolder = 'EMAILADDRESS@DOMAIN.COM';
const stateMachineName = 'MainSM';

const handleRecordCreate = (pressedKeysRef, inputFocusedRef, createRecord, rive) => {
  let text = pressedKeysRef.current; // Use the ref value here

  if (inputFocusedRef.current && text?.length) {
    rive.setTextRunValue("txtMailBtn", 'Saving...');
    createRecord({ apiRoute: `${backendRoutePrefix}/signup`, data: { email: text } })
      .then((resp) => {
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

        rive.setTextRunValue("txtMailBtn", 'Submit');
        rive.setTextRunValue("txtMailMsg", err?.message);
      });
  }
}

const handleRemoveRecord = (pressedKeysRef, removeRecord, rive, verified) => {
  let text = pressedKeysRef.current;
  if (text && text?.length) {
    if (verified) {
      rive.setTextRunValue("btnYesSubmit", 'Removing...');
    } else {
      rive.setTextRunValue("btnRemoveSubmit", 'Removing...');
    }
    removeRecord({ apiRoute: `${backendRoutePrefix}/remove-record/${text}`, data: { email: text } })
      .then((resp) => {
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
        rive.setTextRunValue("btnResendSubmit", 'Resend');
        const stateMachineInput = rive.stateMachineInputs(stateMachineName).find(input => input.name === "isExistAndNotVerified");
        if (stateMachineInput) {
          stateMachineInput.value = false;
          rive.setTextRunValue("txtMailMsg", '');
          rive.setTextRunValue("txtMailInput", defaultInputPlaceHolder);
        }
      })
      .catch((err) => {

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
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');

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
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  const onRiveEventReceived = (riveEvent) => {
    const eventData = riveEvent.data;
    switch (eventData.name) {
      case "txtFiedMouseDown":
        inputFocusedRef.current = true;
        break;
      case "btnSubmitClick":
        handleRecordCreate(pressedKeysRef, inputFocusedRef, createRecord, rive);
        inputFocusedRef.current = false;
        break;
      case "btnRemoveSubmit":
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

  useEffect(() => {
    if (rive && token) {
      axios.get(`${backendRoutePrefix}/verify-email?token=${token}`)
        .then(response => {
          
          rive.setTextRunValue("txtMailMsg", response.data.message);

        })
        .catch(error => {
          console.log(error);
          rive.setTextRunValue("txtMailMsg", error.response.data.message);
        });
    }
  }, [token, rive]);

  return <RiveComponent />;
};

export default RiveMailingList;
