import { pb } from '$services/backend.service';
import { currentUser } from '$services/backend.service';
import { toast } from '$services/toast';

export const signUpWithEmail = async (email: string, password: string) => {
  let error: any = null;
  try {
    const user = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
    });
    currentUser.set(user);

    try {
      const result = await pb.collection("users").requestVerification(email);

      // try logging in...
      const { user, error } = await signInWithEmail(email, password);

      return { user, error: null};
    } catch (error: any) {
      console.error(error);
      return { user, error};
    }
    return { user, error: null};
  } catch (error: any) {
    console.error(error);
    return { user: null, error}
  }

//  return { user: data.user, session: data.session, error };

  }
  
  // TODO: this is not working
  export const sendMagicLink = async (email: string) => {
    toast('Magic link not implemented yet')
  }
  
  export const signInWithEmail = async (email: string, password: string) => {

    try {
      const authData = await pb.collection('users').authWithPassword(email, password);

      // after the above you can also access the auth data from the authStore
      currentUser.set(pb.authStore.model);
      let error: any = null;
      return { user: authData, error: null };
  
    } catch (error: any) {
      console.error(error);
      currentUser.set(null);
      return { user: null, error}
    }
  }

  export const resetPassword = async (email: string) => {
    try {
      const data = await pb.collection('users').requestPasswordReset(email);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  