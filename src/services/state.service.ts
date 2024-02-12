import { currentUser } from '$services/backend.service'
import { writable } from 'svelte/store';

let user: any = {};
let _currentState: any = {};
interface CurrentState {
    selectedMenuItem?: string;
}

export let currentState: any = writable<CurrentState>({});
const saveState = (value: CurrentState) => {
    if (!value || JSON.stringify(value) === '{}') return;
    try {
        localStorage.setItem('currentState', JSON.stringify(value));
    } catch (error) {
        console.error('Error saving currentState to localStorage', error);
    }
}

// subscribe to currentState and save to localStorage
currentState.subscribe((value: any) => {
    _currentState = value;
    saveState(value);
});

currentUser.subscribe((value: any) => {
    user = value;
});


  const restoreState = () => {
    try {
        currentState.set(JSON.parse(localStorage.getItem('currentState') || '{}'));
    } catch (error) {
        console.error('Error restoring currentState from localStorage', error);
    } 
    setTimeout(() => {
        // delayed updates here (after 2 seconds, wait for state to be restored first)
    }, 2000);
}
restoreState();
