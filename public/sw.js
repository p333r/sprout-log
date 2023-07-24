if (!self.define) {
  let e,
    s = {};
  const o = (o, a) => (
    (o = new URL(o + ".js", a).href),
    s[o] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = o), (e.onload = s), document.head.appendChild(e);
        } else (e = o), importScripts(o), s();
      }).then(() => {
        let e = s[o];
        if (!e) throw new Error(`Module ${o} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, r) => {
    const c =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[c]) return;
    let i = {};
    const f = (e) => o(e, c),
      n = { module: { uri: c }, exports: i, require: f };
    s[c] = Promise.all(a.map((e) => n[e] || f(e))).then((e) => (r(...e), i));
  };
}
define(["./workbox-900a5e11"], function (e) {
  "use strict";
  self.addEventListener("message", (e) => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        {
          url: "android-chrome-192x192.png",
          revision: "857c1fd64f957174f4b6408f6e60fcb9",
        },
        {
          url: "android-chrome-512x512.png",
          revision: "308733136df3b1a086954cb4a7f8bce0",
        },
        {
          url: "apple-touch-icon.png",
          revision: "396dff196cde41b6da85e4a0baec2280",
        },
        {
          url: "assets/accept.svg",
          revision: "835aa40878c644494f660d8f34dbb2df",
        },
        {
          url: "assets/color-logo-no-background-v1.svg",
          revision: "d89929b80b76b27313a26044b2a1fbd9",
        },
        {
          url: "assets/color-logo-no-background-v2.svg",
          revision: "c5f80513b825ca078cf84aff9fa3cb61",
        },
        {
          url: "assets/color-logo-no-background-v3.svg",
          revision: "6adfa8ce25f9c0662b76960be3cfac64",
        },
        {
          url: "assets/color-logo-no-background-v4.svg",
          revision: "321aa5861b164080f055706fc7c85bf0",
        },
        {
          url: "assets/color-logo-no-background-v5.svg",
          revision: "cc120246f19fa050f12470f1e9478e30",
        },
        {
          url: "assets/color-logo-no-background-v7.svg",
          revision: "8858121a3d8f13e7819e85218f179309",
        },
        {
          url: "assets/color-logo-no-background-v8.svg",
          revision: "367c4de1f0f5320674f0a7b649ade335",
        },
        {
          url: "assets/drop.svg",
          revision: "e4431485c95f3c961503afa90fa593fe",
        },
        {
          url: "assets/exclamation.svg",
          revision: "2e093e188a8efb037b273c73c283f49e",
        },
        {
          url: "assets/flag.svg",
          revision: "33dfe3488bc9fbb946c05a0206c5ff56",
        },
        {
          url: "assets/hourglass.svg",
          revision: "05dd3682d6d2cb75ccee4ae31c6d67de",
        },
        {
          url: "assets/plant.svg",
          revision: "fbc7aae5ba47218461682ffa6eb0908e",
        },
        {
          url: "favicon-16x16.png",
          revision: "021252d527cc36203a906952373d0bc8",
        },
        {
          url: "favicon-32x32.png",
          revision: "b7373323309572d581e12e6163849d8b",
        },
        { url: "favicon.ico", revision: "276aeab471a4703558ca4b6055f91b22" },
        {
          url: "javascripts/admin.js",
          revision: "211e8a2f25a796966d6dad339f6246dc",
        },
        {
          url: "javascripts/clock.js",
          revision: "abe422d9aa259fe8a040d1a4904ff58a",
        },
        {
          url: "javascripts/sprouts.js",
          revision: "cdbf559c27c3f2aa923437493fb975a8",
        },
        {
          url: "site.webmanifest",
          revision: "4e3dcd31130182a8337bab1ad18a5594",
        },
        {
          url: "stylesheets/style.css",
          revision: "069c019df1befc8df11fec062198ad8d",
        },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    );
});
//# sourceMappingURL=sw.js.map
