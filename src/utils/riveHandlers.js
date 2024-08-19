export const handleRecordCreate = (pressedKeysRef, inputFocusedRef, createRecord, rive, backendRoutePrefix, stateMachineName) => {
    let text = pressedKeysRef.current; // Use the ref value here

    if (inputFocusedRef.current && text?.length) {
        rive.setTextRunValue("txtMailMsg", "");
        rive.setTextRunValue("txtMailBtn", 'Saving...');
        createRecord({ apiRoute: `${backendRoutePrefix}/signup`, data: { email: text } })
            .then((resp) => {
                rive.setTextRunValue("txtMailBtn", 'Submit');
                if (resp && resp?.status === 'email-found-and-not-verified') {
                    const stateMachineInput = rive.stateMachineInputs(stateMachineName).find(input => input.name === "isExistAndNotVerified");
                    if (stateMachineInput) {
                        stateMachineInput.value = true;
                        rive.setTextRunValue("txtMailInput", "Email Already Found But Not Verified! Do you wish to resend the verification request or remove your email from our system?");
                    }
                } else if (resp && resp?.status === 'email-found-and-verified') {
                    const stateMachineInput = rive.stateMachineInputs(stateMachineName).find(input => input.name === "isExistAndVerifiedState");
                    if (stateMachineInput) {
                        stateMachineInput.value = true;
                        rive.setTextRunValue("txtMailInput", "Email Already Found! Do you wish to remove your email from our mailing list system?");
                    }
                } else if (resp && resp?.status === 'record-save') {
                    rive.setTextRunValue("txtMailMsg", 'Thank you for your Submission; please check your email to Verify your Registration.');
                    rive.setTextRunValue("txtMailInput", 'EMAILADDRESS@DOMAIN.COM');
                    pressedKeysRef.current = '';
                }
            })
            .catch((err) => {
                rive.setTextRunValue("txtMailBtn", 'Submit');
                rive.setTextRunValue("txtMailMsg", err?.message);
            });
    }
}

export const handleRemoveRecord = (pressedKeysRef, removeRecord, rive, verified, backendRoutePrefix, stateMachineName) => {
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
                    rive.setTextRunValue("txtMailInput", 'EMAILADDRESS@DOMAIN.COM');
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

export const handleResend = (pressedKeysRef, updateRecord, rive, backendRoutePrefix, stateMachineName) => {
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
                    rive.setTextRunValue("txtMailInput", 'EMAILADDRESS@DOMAIN.COM');
                }
            })
            .catch((err) => {
                rive.setTextRunValue("btnResendSubmit", 'Resend');
                rive.setTextRunValue("txtMailMsg", err?.message);
            });
    }
}

export const handleCancel = (rive, stateMachineName, defaultInputPlaceHolder) => {
    const stateMachineInput = rive.stateMachineInputs(stateMachineName).find(input => input.name === "isExistAndVerifiedState");
    if (stateMachineInput) {
        stateMachineInput.value = false;
        rive.setTextRunValue("txtMailMsg", '');
        rive.setTextRunValue("txtMailInput", defaultInputPlaceHolder);
    }
}
