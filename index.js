const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const PLUGIN_NAME = 'graphviz-and-plant-uml';

function getTmp() {
    const filename = 'foo' + crypto.randomBytes(4).readUInt32LE(0) + 'bar';
    return "/tmp/" + filename;
}

/**
 *
 * @param {String}str your uml string
 * @param {String}GraphvizDotFile: GraphvizDotFile binary
 * @param {Array<String>}PlantJar: Plant Jar
 * @returns {Promise}
 * @private
 */
function _string2ImgAsync(str, GraphvizDotFile, PlantJar) {
    const tmpFile = getTmp();
    var outputFormat = this.generator === 'ebook' ? 'png' : 'svg';
    return new Promise((resolve, reject) => {
        fs.writeFile(tmpFile, str, function (err) {
            if (err) {
                return console.log(err);
            }
            // run plantuml -help for more
            const args = [
                '-jar', PlantJar,
                '-D', 'java.awt.headless=true',
                '-t' + outputFormat, '-graphvizdot', GraphvizDotFile,
                tmpFile
            ];
            childProcess.execFile("java", args, function (err, stdout, stderr) {
                if (err || stderr) {
                    console.log("err=");
                    console.log(stderr);
                    fs.unlinkSync(tmpFile);
                    reject(err || stdout)
                } else {
                    const text = fs.readFileSync(tmpFile + '.' + outputFormat, 'utf8');
                    fs.unlinkSync(tmpFile);
                    fs.unlinkSync(tmpFile + '.svg');
                    const img = "<img src='data:image/svg+xml;base64," + new Buffer(text).toString('base64') + "'>";
                    resolve(img)
                }
            });
        });
    })
}

module.exports = {
    blocks: {
        puml: {
            process: function (block) {
                var GraphvizDotFile = this.config.get('pluginsConfig.' + PLUGIN_NAME + '.GraphvizDotFile');
                var PlantJar = this.config.get('pluginsConfig.' + PLUGIN_NAME + '.PlantJar');
                if (!PlantJar || !GraphvizDotFile){
                    throw "Please fullfill GraphvizDotFile and PlantJar"
                }
                var body = block.body;
                var src = block.kwargs.src;
                if (src) {
                    var relativeSrcPath = url.resolve(this.ctx.file.path, src)
                    var absoluteSrcPath = decodeURI(path.resolve(this.book.root, relativeSrcPath))
                    body = fs.readFileSync(absoluteSrcPath, 'utf8')
                }
                return _string2ImgAsync(body, GraphvizDotFile, PlantJar);
            }
        }
    }, hooks: {
        'page:before': async function processMermaidBlockList(page) {
            const mermaidRegex = /^```puml((.*[\r\n]+)+?)?```$/im;
            var match;
            while ((match = mermaidRegex.exec(page.content))) {
                var rawBlock = match[0];
                var mermaidContent = match[1];
                const KEY = 'puml';
                const processed = "{% " + KEY + " %}\n" + mermaidContent + "{% end" + KEY + " %}\n"
                page.content = page.content.replace(rawBlock, processed);
            }
            return page;
        }
    }
};