// import { writable } from 'svelte/store';
// export let pathStack: any = writable<string[]>([]);
export let pathStack: string[] = []

import { afterNavigate } from '$app/navigation';
import { base } from '$app/paths'

// export const pushPathStack = async () => {
//   return new Promise((resolve) => {
//     afterNavigate(({from}) => {
//       if (from !== null && from?.url !== null) {
//         resolve(from?.url.pathname || base || '/');
//       } else {
//         resolve(base || '/');
//       }
//     });
//   });
// }
export const pushPathStack = async () => {
      afterNavigate(({from}) => {
        if (from !== null && from?.url !== null) {
            pathStack.push(from?.url.pathname || base || '/');
        } else {
            pathStack.push(base || '/');
        }
      });
}

export const popPathStack = () => {
    const path = pathStack.pop();
    return path || base || '/';
}