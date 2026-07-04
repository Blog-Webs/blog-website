try {
  const app = require('./src/app.js');
  console.log("SUCCESS: app.js parsed and required all modules successfully without throwing.");
} catch (e) {
  console.error("FAIL: Error requiring app.js");
  console.error(e);
}
