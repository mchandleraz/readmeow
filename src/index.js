const fs = require('fs');
const requestPromise = require('request-promise');
const LineByLineReader = require('line-by-line');

const workingDirectory = process.cwd();
const filepath = `${workingDirectory}/README.md`;
const package = require(`${workingDirectory}/package.json`);

exports.readMeow = function() {
  requestPromise('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat')
    .then(function(response) {
      const data = JSON.parse(response).data;
      const gifMarkdown = `![powered by readmeow](${data.image_original_url})`;

      let readme = new LineByLineReader(filepath);
      let finalMarkdown = '';
      let hasCat = false;

      readme.on('error', function(err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
        readme = fs.createWriteStream(filepath);
        readme.write(`# ${package.name}\n${gifMarkdown}`);
        hasCat = true;
      });
      readme.on('line', function(line) {
        if (hasCat || (line.indexOf('powered by readmeow') > -1)) {
          return;
        }

        if (line.match(/^\#{1,6}/g)) {
          // TODO: review regex. This might be better: /(^\#{1,6}.*\w$)/g
          line += '\n' + gifMarkdown + '\n';
        }

        finalMarkdown += line;
        hasCat = true;
      });
      readme.on('end', function() {
        let _readme = fs.createWriteStream(filepath);
        _readme.write(finalMarkdown);
      });
    })
    .catch(function(err) {
      throw err;
    });
}
