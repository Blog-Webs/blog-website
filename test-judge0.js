const data = {
  source_code: 'print("hello")',
  language_id: 71
};

fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
