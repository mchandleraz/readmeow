#!/usr/bin/env node

const fs = require('fs');
const requestPromise = require('request-promise');
const LineByLineReader = require('line-by-line');

const workingDirectory = process.cwd();
const filepath = `${workingDirectory}/README.md`;
const package = require(`${workingDirectory}/package.json`);
const altTag = 'powered by readmeow';

let hasCat = false;

readmeow();

function readmeow() {
  requestPromise('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat')
    .then(function(response) {
      const gifMarkdown = generateReadmeowMarkdown(response);

      let readme = new LineByLineReader(filepath);
      let finalMarkdown = '';

      readme.on('error', function(error) {
        onLineByLineError(error, gifMarkdown);
      });
      readme.on('line', function (line) {
        onLineByLineRead(line, gifMarkdown, finalMarkdown);
      });
      readme.on('end', function () {
        if (finalMarkdown.length > 0) {
          writeReadme(filepath, finalMarkdown);
        }
      });
    })
    .catch(function(error) {
      throw error;
    });
}

function generateReadmeowMarkdown(response) {
  return `![${altTag}](${JSON.parse(response).data.image_url})`;
}

function onLineByLineError(error, gifMarkdown) {
  if (error.code !== 'ENOENT') {
    // if erroror is anything other than "no file":
    throw error;
  }
  // error.code is essentially "no file", so:
  readme = fs.createWriteStream(filepath);
  readme.write(`# ${package.name}\n${gifMarkdown}`);
  hasCat = true;
}

function writeReadme(path, content) {
  let _readme = fs.createWriteStream(path);
  _readme.write(content);
}

function onLineByLineRead(line, gifMarkdown, finalMarkdown, iterator) {
  if (line.indexOf(altTag) > -1) {
    hasCat = true;
  }

  if (hasCat) {
    return;
  }

  if (line.match(/^\#{1,6}/g)) {
    line += '\n' + gifMarkdown + '\n';
  }

  finalMarkdown += line;
  hasCat = true;
}
