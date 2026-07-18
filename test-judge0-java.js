const data = {
  source_code: 'public class tanish { public static void main(String[] args) { System.out.println("hello tanish"); } }',
  language_id: 62
};

fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
