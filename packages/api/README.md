# Backend

The backend is running on Port 3002

## Environment Variables

```.env
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=https://yourdomain.com/auth/meta/callback
META_GRAPH_API_VERSION=v19.0
FRONTEND_URL=frontend-url
```

`META_APP_ID` and `META_APP_SECRET` can be obtained from the [Meta for Developers](https://developers.facebook.com/) page. Should be under the `basic settings` tab of your app.

`META_REDIRECT_URI` is the URL where the user will be redirected after authentication. It should match the redirect URI set in your Meta app settings.

- Local should be `http://localhost:3002/auth/meta-callback`
- Production should be `https://yourdomain.com/auth/meta-callback`

## Setting up Meta App

1. create a new app on [Meta for Developers](https://developers.facebook.com/)
   1. make it a business app & select 'other' for the app type. set the app up for instagram
2. add instagram tester under roles
3. accept the tester invites under [apps and website settings on instagram](https://www.instagram.com/accounts/manage_access/)
4. generate a new access token for the tester account

## Callback URL

The callback URL needs to be added to your Meta app settings under the OAuth redirect URIs section and the Instagram App settings. (**BOTH** need the URLs to be set)

While facebook login automatically supports localhost callbacks, Instagram login does not. Hence, you need to use a service like [ngrok](https://ngrok.com/) to expose your local server to the internet for testing purposes.

```bash
ngrok http 3002 # since backend runs on port 3002
```

Copy the generated ngrok URL and use it in your `.env` file and add to your Meta app settings as the redirect URI.

```bash
INSTAGRAM_REDIRECT_URI={ngrok-url}/auth/instagram-callback
```

## APIs

### Authentication

- `/auth/facebook-login` - Initiates the Facebook login process.
- `/auth/facebook-callback` - Handles the callback from Facebook after login.
- `auth/instagram-login` - Initiates the Instagram login process.
- `/auth/instagram-callback` - Handles the callback from Instagram after login.

### Instagram APIs

- `POST /instagram/demographics/followers` - Fetches the demographics of the followers of the authenticated Instagram account.
- `POST /instagram/demographics/engaged-audience` - Fetches the demographics of the engaged audience of the authenticated Instagram account.
- `POST /instagram/follows-and-unfollows` - Fetches the follows and unfollows of the authenticated Instagram account.
- `POST /instagram/media` - Fetches the media of the authenticated Instagram account.
