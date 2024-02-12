import { pb } from '$services/backend.service';
export const signInWithProvider = async (provider: string) => {
  // If the popup is being blocked on Safari, you can try the suggestion from:
  // https://github.com/pocketbase/pocketbase/discussions/2429#discussioncomment-5943061.

  let w = window.open()
  if (w) {
    const retval = await pb.collection("users")
    .authWithOAuth2({
        provider: provider,
        urlCallback: (url) => {
          if (w) w.location.href = url
        },
      })    
      return retval;
  } else {
    return null;
  }

  // return await pb.collection('users').authWithOAuth2({ provider });

  // custom scopes to overwrite the default ones
  // scopes?: Array<string>;

  // optional record create data
  // createData?: {[key: string]: any};

  // optional callback that is triggered after the OAuth2 sign-in/sign-up url generation
  // urlCallback?: OAuth2UrlCallback,
}
  