import { currentUser } from '$services/backend.service';
import { pb } from '$services/backend.service';
export const signOut = async () => {
    pb.authStore.clear();
    localStorage.clear();
    currentUser.set(null);
    return { error: null };
  }
  