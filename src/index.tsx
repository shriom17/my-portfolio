import { serve } from "bun";
import { fileURLToPath } from "node:url";
import index from "./index.html";

const server = serve({
  routes: {
    "/My-Resume.pdf": {
      async GET() {
        const pdfPath = fileURLToPath(new URL("../public/My-Resume.pdf", import.meta.url));
        const file = Bun.file(pdfPath);
        return new Response(file, {
          headers: {
            "Content-Type": "application/pdf",
            "Cache-Control": "no-store, no-cache, must-revalidate",
            Pragma: "no-cache",
          },
        });
      },
    },

    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
