export function printRoutes(app) {
  const stack = app.router?.stack ?? app._router?.stack ?? [];

  function extractMountPath(layer) {
    // layer.regexp is a RegExp like /^\/api\/auth\/?(?=\/|$)/i
    const source = layer.regexp?.source ?? "";
    if (!source || source === "^\\/?(?=\\/|$)") return "";

    // Strip regex anchors and the trailing lookahead
    let path = source
      .replace(/^\^/, "") // leading ^
      .replace(/\\\/\?\(\?=\\\/\|\$\)$/, "") // trailing \/?(?=\/|$)
      .replace(/\\\//g, "/") // escaped slashes → /
      .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ":param") // optional param groups
      .replace(/\$$/, ""); // trailing $

    if (!path.startsWith("/")) path = "/" + path;
    return path === "/" ? "" : path;
  }

  function walk(stack, prefix = "") {
    for (const layer of stack) {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .join(", ")
          .toUpperCase();
        const full = (prefix + layer.route.path).replace(/\/+/g, "/");
        console.log(`${methods.padEnd(12)} ${full}`);
      } else if (layer.handle?.stack) {
        const mount = extractMountPath(layer);
        walk(layer.handle.stack, prefix + mount);
      }
    }
  }

  walk(stack);
}
