const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Serve Resume.pdf and other static files from public directory
    if (url.pathname.startsWith('/artwork/') || url.pathname.endsWith('.pdf') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png')) {
      const filePath = `./public${url.pathname}`;
      try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
          return new Response(file);
        }
      } catch (error) {
        console.error('Error serving static file:', error);
      }
    }
    
    // For all other requests, serve the built React application
    try {
      // Build the React app on demand
      const result = await Bun.build({
        entrypoints: ['./src/frontend.tsx'],
        minify: false,
        sourcemap: 'external',
        target: 'browser',
        format: 'esm',
        splitting: false,
        outdir: './dist-temp',
      });
      
      if (result.success && result.outputs.length > 0) {
        // Get the built JavaScript content
        const jsOutput = result.outputs.find(output => output.path.endsWith('.js'));
        if (jsOutput) {
          const jsContent = await jsOutput.text();
          
          // Create HTML with the bundled JavaScript
          const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
  <style>
    body { 
      margin: 0; 
      background: #111827; 
      color: white; 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">${jsContent}</script>
</body>
</html>`;
          
          return new Response(html, {
            headers: { 'Content-Type': 'text/html' },
          });
        }
      }
      
      // Fallback: serve basic HTML if build fails
      return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
</head>
<body>
  <div id="root"></div>
  <p>Error loading application. Please check the console.</p>
</body>
</html>`, {
        headers: { 'Content-Type': 'text/html' },
      });
    } catch (error) {
      console.error('Error serving app:', error);
      return new Response('Server Error: ' + (error instanceof Error ? error.message : 'Unknown error'), { status: 500 });
    }
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}/`);