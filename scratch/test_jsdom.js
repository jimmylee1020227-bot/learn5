const { JSDOM } = require('jsdom');
const path = require('path');
const fs = require('fs');

async function testPage() {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
  
  const dom = new JSDOM(html, {
    url: "http://localhost:5173/",
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
  });
  
  const virtualConsole = dom.window.console;
  virtualConsole.on("error", (err) => {
    console.log("JSDOM Error:", err);
  });
  
  dom.window.addEventListener("error", (event) => {
    console.error("Uncaught exception:", event.error);
  });
  
  dom.window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });

  // Give it a few seconds to load resources and execute scripts
  setTimeout(() => {
    console.log("JSDOM Test Finished.");
    process.exit(0);
  }, 5000);
}

testPage();
