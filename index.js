var request = require('request');
var async = require('async');
var fs = require('fs');

getQuotes(write);

function write(err,quotes){
  if(err)
  {
    console.log("problem "+err);
    return;
  }
  fs.writeFile("quotes.txt",quotes.join("\n"));
}

function getQuotes(cb)
{
  var quotes={};
  var repetition=0;
  var maxRepetition=10000;
  async.whilst(
    function(){
      return repetition<maxRepetition;
    },
    function(cb)
    {
      var f=function(cb){
        getQuote(function(err,quote){
          if(err)
          {
            cb(err);
            return;
          }
          if(quotes[quote])
          {
            repetition++;
            console.log(repetition);
          }
          quotes[quote]=1;
          cb(null);
        });
      };
      var ff=[];
      for(var i=0;i<100;i++)
        ff.push(f);
      async.parallel(ff,cb);
    },
    function() {
      cb(null,Object.keys(quotes).sort());
    }
  );
}

function getQuote(cb)
{
  request('https://smoothirc.net/', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var results=body.match(/<div id="footer" class="clear">[\s\S]*?<p>([\s\S]+?)<\/p>/);
      if(!results)
        cb(new Error("Can't match"));
      var quote=results[1];
      quote=quote.replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();
      cb(null,quote);
    }
    else if(error)
    {
      cb(error);
    }
    else
    {
      cb(new Error("Wrong statusCode : "+response.statusCode));
    }
  })
}
