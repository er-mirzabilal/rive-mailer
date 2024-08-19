import { EventType, useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from "react";
import { useCreateRecord, useDeleteRecord, useUpdateRecord } from "../../hooks/queryClient";
import axios from 'axios';
import { handleRecordCreate, handleRemoveRecord, handleResend, handleCancel } from "../../utils/riveHandlers";
import { usePressedKeys } from "../../hooks/usePressedKeys";

const backendRoutePrefix = 'http://localhost:8000';
const defaultInputPlaceHolder = 'EMAILADDRESS@DOMAIN.COM';
const stateMachineName = 'MainSM';

const RiveMailingList = () => {
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');

  const inputFocusedRef = useRef(false); // Ref for input focused state
  

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
  const { pressedKeysRef } = usePressedKeys(rive, inputFocusedRef);

  const onRiveEventReceived = (riveEvent) => {
    const eventData = riveEvent.data;
    switch (eventData.name) {
      case "txtFiedMouseDown":
        inputFocusedRef.current = true;
        break;
      case "btnSubmitClick":
        handleRecordCreate(pressedKeysRef, inputFocusedRef, createRecord, rive, backendRoutePrefix, stateMachineName);
        inputFocusedRef.current = false;
        break;
      case "btnRemoveSubmit":
        handleRemoveRecord(pressedKeysRef, removeRecord, rive, false, backendRoutePrefix, stateMachineName);
        break;
      case "btnResendSubmit":
        handleResend(pressedKeysRef, updateRecord, rive, backendRoutePrefix, stateMachineName);
        break;
      case "btnYesSubmit":
        handleRemoveRecord(pressedKeysRef, removeRecord, rive, true, backendRoutePrefix, stateMachineName);
        break;
      case "btnNoSubmit":
        handleCancel(rive, stateMachineName, defaultInputPlaceHolder);
        break;
      default:
        console.log('overall clicked');
        break;
    }
  };

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
