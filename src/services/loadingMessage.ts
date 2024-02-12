import { loadingController } from "$ionic/svelte";

export const loadingBox = async (message: string = 'Loading...') => {

    const controller = 
    await loadingController.create({
        message
    });
    controller.present();
    return controller;
  }
