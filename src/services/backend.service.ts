import PocketBase, { BaseAuthStore } from 'pocketbase';
import { writable } from 'svelte/store';

/*
class CustomAuthStore extends BaseAuthStore {
    save(token: any, model: any) {
        super.save(token, model);

        // your custom business logic...
    }
}
export const pb = new PocketBase('http://127.0.0.1:8090', new CustomAuthStore());
*/

// get current host and port
const host = window.location.hostname;
let port = window.location.port;
export let apiURL = '';
if (host === 'localhost' || host === '127.0.0.1') port = '8090';


if (false && (host === 'localhost' || host === '127.0.0.1')) {
  apiURL = "https://air-port.dev";
} else {
  // get current protocol (http or https)
  const protocol = window.location.protocol;
  apiURL = `${protocol}//${host}`;
  if (port) apiURL += `:${port}`;
  apiURL += '/';
}
// console.log('apiURL', apiURL);
export const pb = new PocketBase(apiURL);

export let currentUser: any = writable<any | null>(null);

const removeListener1 = pb.authStore.onChange((token, model) => {
  currentUser.set(model);
});

export const loadUser = async () => {
  // get all keys from localStorage
  if (pb.authStore.model) {
    currentUser.set(pb.authStore.model);
    pb.collection('users').authRefresh()
    // const user = await pb.collection('users').authRefresh();
    // if (user?.record) {
    //   console.log('updating user.record', user.record)
    //   currentUser.set(user.record);
    // }  
  }
};
loadUser();


