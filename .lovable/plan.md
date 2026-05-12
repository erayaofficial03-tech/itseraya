## Goal

Replace Lovable's hosted Google consent screen with one served by Google itself, branded as **Eraya**. After this, the sign-in popup will show your Eraya logo, app name, and domain — no "Lovable" wordmark, no template name.

## What changes

Nothing in the app's source code changes. Google sign-in already works through `lovable.auth.signInWithOAuth("google", …)`; we're only swapping the **OAuth credentials** the broker uses behind it.

## Steps you'll do in Google Cloud Console

1. Go to https://console.cloud.google.com/ → create (or pick) a project named **Eraya**.
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: **Eraya**
   - User support email: your address
   - App logo: upload the Eraya logo
   - Authorized domains: `lovable.app` and your custom domain if you have one (e.g. `itseraya.in`)
   - Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
   - Publish the app (Testing → In production) so any Google user can sign in
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: **Eraya Web**
   - Authorized redirect URI: paste the **callback URL** shown in Lovable Cloud → Auth Settings → Google (I'll point you to it in step 4 below)
4. Copy the generated **Client ID** and **Client Secret**.

## Steps I'll guide you through in Lovable Cloud

5. Open **Cloud → Users → Auth Settings → Sign In Methods → Google**.
6. Copy the **callback URL** shown there → paste it back into the Google credential from step 3.
7. Toggle "Use my own credentials", paste **Client ID** and **Client Secret**, save.

## Verification

8. From an incognito window, click **Sign in with Google** on the site. The consent screen should now show:
   - Your Eraya logo
   - "Sign in to continue to **Eraya**"
   - The Google chrome (no "Lovable" wordmark, no "Remix of Ecommerce Store Website Template")

## Notes

- No code changes, no migration, no downtime — existing accounts keep working.
- If you later add a custom domain, just add it to "Authorized domains" in the consent screen config.
- The internal Lovable project name stays as-is per your choice; it's only visible to you in the editor.