/// <reference path="../pb_data/types.d.ts" />

onRecordBeforeConfirmPasswordResetRequest((e) => {
    if (e.record) {
        e.record.setVerified(true); // this will be saved only if the password reset is successful
    }
})