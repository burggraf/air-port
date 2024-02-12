  import { alertController } from "$ionic/svelte";

  export const showAlert = async (options: any) => {
    const alert = await alertController.create(options);
    alert.present();
  };

  export const showInputAlert = async () => {
    const options = {
      cssClass: "my-custom-class",
      header: "Prompt!",
      inputs: [
        {
          name: "name1",
          type: "text",
          placeholder: "Placeholder 1",
        },
        {
          name: "name2",
          type: "text",
          id: "name2-id",
          value: "hello",
          placeholder: "Placeholder 2",
        },
        // multiline input.
        {
          name: "paragraph",
          id: "paragraph",
          type: "textarea",
          placeholder: "Placeholder 3",
        },
        {
          name: "name3",
          value: "http://ionicframework.com",
          type: "url",
          placeholder: "Favorite site ever",
        },
        // input date with min & max
        {
          name: "name4",
          type: "date",
          min: "2017-03-01",
          max: "2018-01-12",
        },
        // input date without min nor max
        {
          name: "name5",
          type: "date",
        },
        {
          name: "name6",
          type: "number",
          min: -5,
          max: 10,
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            // console.log("Confirm Cancel");
          },
        },
        {
          text: "Ok",
          handler: () => {
            // console.log("Confirm Ok");
          },
        },
      ],
    };

    return showAlert(options);
  };

  export const showSimpleAlert = async () => {
    const options = {
      header: "Prompt!",
      subHeader: "Subtitle",
      message: "This is an alert message.",
      buttons: ["OK"],
    };

    return showAlert(options);
  };
  export const alert = async (obj: any) => {
    const options = {
      header: obj.header || undefined,
      subHeader: obj.subHeader || undefined,
      message: obj.message || undefined,
      buttons: obj.buttons || ["OK"],
    };

    return showAlert(options);
  };

  export const showConfirm = async (obj: any) => {
    const options = {
      header: obj.header || "Confirm",
      subHeader: obj.subHeader || undefined,
      message: obj.message || "Are you sure?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            if (obj.cancelHander) {
                obj.cancelHander();
            } else {
                // console.log("Cancel");
            }
          },
        },
        {
          text: "OK",
          role: "confirm",
          handler: () => {
            if (obj.okHandler) {
                obj.okHandler();
            } else if (obj.onOk) {
                obj.onOk();
            }
          },
        },
      ],
    };

    return showAlert(options);
  };

  export const showRadioAlert = async () => {
    const options = {
      header: "Radio",
      subHeader: "Subtitle",
      message: "This is an alert message.",
      inputs: [
        {
          type: "radio",
          label: "Radio 1",
          value: "value1",
          checked: true,
        },
        {
          type: "radio",
          label: "Radio 2",
          value: "value2",
        },
        {
          type: "radio",
          label: "Radio 3",
          value: "value3",
        },
        {
          type: "radio",
          label: "Radio 4",
          value: "value4",
        },
        {
          type: "radio",
          label: "Radio 5",
          value: "value5",
        },
        {
          type: "radio",
          label: "Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 ",
          value: "value6",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            // console.log("Confirm Cancel");
          },
        },
        {
          text: "Ok",
          handler: (data: any) => {
            // console.log("Confirm Ok", data);
          },
        },
      ],
    };

    return showAlert(options);
  };

  export const showCheckboxAlert = async () => {
    const options = {
      header: "Radio",
      subHeader: "Subtitle",
      message: "This is an alert message.",
      inputs: [
        {
          type: "checkbox",
          label: "Checkbox 1",
          value: "value1",
          checked: true,
        },
        {
          type: "checkbox",
          label: "Checkbox 2",
          value: "value2",
        },
        {
          type: "checkbox",
          label: "Checkbox 3",
          value: "value3",
        },
        {
          type: "checkbox",
          label: "Checkbox 4",
          value: "value4",
        },
        {
          type: "checkbox",
          label: "Checkbox 5",
          value: "value5",
        },
        {
          type: "checkbox",
          label: "Checkbox 6",
          value: "value6",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            // console.log("Confirm Cancel");
          },
        },
        {
          text: "Ok",
          handler: (data: any) => {
            // console.log("Confirm Ok", data);
          },
        },
      ],
    };

    return showAlert(options);
  };
