var fetch  = require('node-fetch');
 
    async function load(){

   var url = 'https://www.reddit.com/r/lotrmemes/top.json';
     var obj = await fetch(url);
     var random=Math.floor(Math.random() * Math.floor(10));
     var json = await obj.json();

     var ass = json.data.children[random].data.url_overridden_by_dest
 
     return  ass
 }
    load()
module.exports ={
    load
}