import { popoverController } from "$ionic/svelte"
import DropdownMenu from "./DropdownMenu.svelte"
export const dropdownmenu = async (e: any /*event*/, items: any) => {
    const openPopover = await popoverController.create({
        component: DropdownMenu,
        event: e,
        size: 'auto',
        cssClass: 'custom-popover',
        componentProps: {
            items
        },
        showBackdrop: true,
        backdropDismiss: true,
        // htmlAttributes: {
        //     style: 'overlfow: scroll !important;',
        //     overflow: 'scroll !important'
        // }
    })
    await openPopover.present(e);
    const { data } = await openPopover.onDidDismiss();
    return data;
}
