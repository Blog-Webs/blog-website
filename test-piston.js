const data = {
  language: 'java',
  version: '15.0.2',
  files: [{
    name: 'tanish.java',
    content: 'public class tanish { public static void main(String[] args) { System.out.println("Hello World"); } }'
  }]
};

fetch('https://emkc.org/api/v2/piston/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(r => r.json())
.then(res => console.log(JSON.stringify(res, null, 2)))
.catch(console.error);
