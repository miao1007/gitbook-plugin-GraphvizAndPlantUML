const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const PLUGIN_NAME = 'GraphvizAndPlantUML';

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
            // GRAPHVIZ_DOT="/usr/local/opt/graphviz/bin/dot"
            // exec java -jar /usr/local/Cellar/plantuml/1.2018.12/libexec/plantuml.jar "$@"
            // and run plantuml -help for more
            // see https://github.com/vliejo/gitbook-plugin-local-plantuml/blob/master/index.js
            childProcess.spawnSync("java", [
                '-Djava.awt.headless=true',
                '-jar', PlantJar,
                '-t' + outputFormat,
                '-graphvizdot', GraphvizDotFile,
                tmpFile
            ], function (err, stdout, stderr) {
                if (err || stderr) {
                    console.log("err=");
                    console.log(stderr);
                    fs.unlinkSync(tmpFile);
                    reject(err || stdout)
                } else {
                    const text = fs.readFileSync(tmpFile + '.' + outputFormat, 'utf8');
                    console.log(text)
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
                console.log(block)
                var GraphvizDotFile = this.config.get('pluginsConfig.' + PLUGIN_NAME + '.GraphvizDotFile');
                var PlantJar = this.config.get('pluginsConfig.' + PLUGIN_NAME + '.PlantJar');
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
            console.log(mermaidRegex)
            var match;
            while ((match = mermaidRegex.exec(page.content))) {
                var rawBlock = match[0];
                var mermaidContent = match[1];
                const processed = "{% " + KEY + " %}\n" + mermaidContent + "{% end" + KEY + " %}\n"
                page.content = page.content.replace(rawBlock, processed);
            }
            return page;
        }
    }
};