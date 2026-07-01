const http = require('http');
const server = http.createServer((req,res)=>{res.end('ok')});
server.listen(4000, ()=>console.log('test server listening on 4000'));
setInterval(()=>{}, 1000000);