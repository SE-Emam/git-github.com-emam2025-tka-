const fetch = require('node-fetch');

async function testFetch() {
  try {
    const res = await fetch('https://tka-egypt.com/api/courses.php', {
       headers: { 'Content-Type': 'application/json' }
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
}
testFetch();
