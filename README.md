# Wedding invitation

A one-page, mobile-first static site for GitHub Pages. Edit [`config.js`](config.js) for names, date, venue, schedule, and the Google Maps URL.

## Share a personalized link

Put the guest’s name in the URL:

```text
https://<user>.github.io/<repo>/?to=Anna
https://<user>.github.io/<repo>/Anna
```

Spaces work if encoded (`?to=Anna%20Lee`). The first screen greets that name. Missing a name shows “Dear Friend”.

## GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Build and deployment.
3. Source: **Deploy from a branch**.
4. Branch: `main`, folder: `/` (root).
5. Open `https://<user>.github.io/<repo>/`.

All asset paths are relative (`./styles.css`, `./assets/...`), so the site works at the project Pages URL.

## Local preview

Open `index.html` in a browser, or from this folder:

```text
python3 -m http.server 8080
```

Then visit `http://localhost:8080/?to=Anna`.
