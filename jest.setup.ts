import "@testing-library/jest-dom";
import "whatwg-fetch";
import { TextDecoder, TextEncoder } from "util";

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder as typeof global.TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

if (typeof Response !== "undefined" && typeof Response.json !== "function") {
  Object.defineProperty(Response, "json", {
    value: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: {
          "content-type": "application/json",
          ...(init?.headers ?? {}),
        },
      }),
  });
}
