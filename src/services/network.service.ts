import { writable } from 'svelte/store';
export let isOnline: any = writable<boolean>(navigator.onLine);
window.addEventListener('offline', function(e) { 
  // console.log('window event: offline')
  isOnline.set(false);
});
window.addEventListener('online', function(e) { 
  // console.log('window event: online')
  isOnline.set(true);
});

// export default class NetworkService {
//     static myInstance:any = null;
//     static getInstance() {
//       if (this.myInstance === null) {
//           this.myInstance = new this();
//         }    
//         return this.myInstance;
//     }

//     public ping = async (page_name: string = '/ping') => {
//       fetch(`${window.location.origin}${page_name}`).then((result) => {
// 				if (result.status === 200) {
// 					console.log(result);
//           return true;
// 				} else {
// 					console.error('ping failed', result)
//           return false;
// 				}			
//       }).catch((err) => {
//         console.error('fetch error', err);
//         //console.log('do something here');
//         return false;
//       })
//     }

// }


