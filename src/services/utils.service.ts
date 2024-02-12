// import { modalController } from '$app/navigation';
// import { showConfirm } from '$services/alert.service';
import { modalController } from '$ionic/svelte'
import SelectFromListModal from '$components/SelectItemFromListModal.svelte'


export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const gen_random_uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
export const uuid_generate_v4 = gen_random_uuid;

export const generateRandomString = (length: number) => {
  // generate a random string consisting of lower case letters and digits
  let result = ''
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  return result
}
export const openModal = async (theModal: any, theProps: any = {}, theOptions: any = {}) => {
  const obj: any = {
    component: theModal,
    componentProps: theProps,
    showBackdrop: true,
    backdropDismiss: true,
  };
  for (const key in theOptions) {
    obj[key] = theOptions[key];
  }
  console.log('obj', obj)
  const openLoginModalController = await modalController.create(obj)

  openLoginModalController.present();
  setTimeout(() => {resizeModal(openLoginModalController)}, 200);
  const { data } = await openLoginModalController.onWillDismiss();
  return data;
}

export const resizeModal = async (openLoginModalController: HTMLIonModalElement) => {
  setTimeout(() => {
    const pg = openLoginModalController.getElementsByClassName('ion-page')[0];
    const header = pg.getElementsByTagName('ion-header')[0];
    const content = pg.getElementsByTagName('ion-content')[0];
    const footer = pg.getElementsByTagName('ion-footer')[0];
    let p = pg.clientHeight;
    if (header) p -= header.clientHeight;
    if (footer) p -= footer.clientHeight;
    content.style.height = p + 'px';
  }, 200);
}

export const isModal = async () => {
  return (await modalController.getTop() !== undefined);
}

export const selectItemFromList = async (obj: any) => {
  const openModal = await modalController.create({
    component: SelectFromListModal,
    componentProps: {
      // dark: false //this.dark
      title: obj.title || "Select Item",
      items: obj.items || [],
      currentItem: obj.currentItem || "",
      allow_write_in: obj.allow_write_in || false,
      add_new_text: obj.add_new_text || "Add New",
    },
    showBackdrop: true,
    backdropDismiss: true,
  });
  await openModal.present()
  const { data } = await openModal.onWillDismiss();
  return {data};
}

export const textFileExtensions = [
  ".txt",
  ".js",
  ".ts",
  ".css",
  ".html",
  ".md",
  ".xml",
  ".json",
  ".csv",
  ".log",
  ".conf",
  ".config",
  ".sh",
  ".bat",
  ".py",
  ".rb",
  ".php",
  ".yml",
  ".yaml",
  ".ini",
  ".java",
  ".cpp",
  ".c",
  ".svelte",
  ".svg",
  ".webmanifest"
];
