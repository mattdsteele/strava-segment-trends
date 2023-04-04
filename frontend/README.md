# Frontend

Built as a static app via the Eleventy SSG

Requires Node 12+

To run, first setup your environment; you'll need API keys for Strava, Maptiler, and Google. See `env-example` for details.

```
npm ci
npm run serve
```

To build for production:

```
npm run build
```

To deploy, push to the `main` branch and GitHub Actions will build and release to production. Watch it with the [Actions](https://github.com/mattdsteele/strava-segment-trends/actions) tab.

Then open http://localhost:8080/

Learn more about Eleventy at https://www.11ty.dev/
