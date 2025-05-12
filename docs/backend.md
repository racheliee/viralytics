# Backend

The backend is running on Port 3002

## Environment Variables
```.env
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=https://yourdomain.com/auth/meta/callback
META_GRAPH_API_VERSION=v19.0
```

`META_APP_ID` and `META_APP_SECRET` can be obtained from the [Meta for Developers](https://developers.facebook.com/) page.

`META_REDIRECT_URI` is the URL where the user will be redirected after authentication. It should match the redirect URI set in your Meta app settings.

- Local should be `http://localhost:3002/auth/meta-callback`
- Production should be `https://yourdomain.com/auth/meta-callback`

## Setting up Meta App
1. create a new app on [Meta for Developers](https://developers.facebook.com/)
   1. make it a business app & select 'other' for the app type. set the app up for instagram
2. add instagram tester under roles
3. accept the tester invites under [apps and website settings on instagram](https://www.instagram.com/accounts/manage_access/)
4. generate a new access token for the tester account