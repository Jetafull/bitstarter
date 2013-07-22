#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

// add for homework
var rest = require('restler');
var sys = require('util');
var URL_DEFAULT = "http://thawing-eyrie-2235.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

function download(url, callback) {
  var resp = rest.get(url);
  resp.on('complete', function(result) {
    if(result instanceof Error) {
      sys.puts('Error' + result.message);
      this.retry(5000);
      return;
    }
    callback(null, result);
  });
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(html, checks) {
    $ = cheerio.load(html);
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

// loads html from a file and checks it
// for exports only
function checkHtmlFile(filename, checks) {
    return checkHtml(fs.readFileSync(filename), checks);
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

    // create a asynch check
function check(err, html) {
    if(err) {
      console.log("Error when getting html content" + err);
      process.exit(1);
    }
    var checks = loadChecks(program.checks);
    var checkJson = checkHtml(html, checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
    fs.writeFile("submission/part3.txt", outJson, function(err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url <url>', 'Address for website')
        .parse(process.argv);

    if (program.file) {
      fs.readFile(program.file, check);
    } else if (program.url) {
      download(program.url, check);
    }
} else {
    exports.loadChecks = loadChecks;
    exports.checkHtmlFile = checkHtmlFile;
}
