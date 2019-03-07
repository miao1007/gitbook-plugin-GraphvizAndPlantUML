const childProcess = require('child_process');
const makeURL = require("./serverRender").makeURL;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const PLUGIN_NAME = 'graphviz-and-plant-uml';
const http = require("http");


function getTmp() {
    const filename =PLUGIN_NAME + crypto.randomBytes(4).readUInt32LE(0);
    return path.join(require('os').tmpdir(), filename);
}

/**
 *
 * @param book: Global book
 * @param svgFileDir: svgFileDir path
 * @returns {string}
 */
function svg2img(book, svgFileDir) {
    return new Promise((resolve, reject) => {
        if (book.generator === 'ebook') {
            // relevant path
            const dest = path.basename(svgFileDir);
            // Copy a file to the output folder
            book.output.copyFile(svgFileDir, dest).then(function () {
                resolve("<img src=\"" + path.join('/' + dest) + "\"/>");
            });
        } else {
            const text = fs.readFileSync(svgFileDir, 'utf8');
            resolve("<img src='data:image/svg+xml;base64," + new Buffer(text.trim()).toString('base64') + "'>");
        }
    })
}


function localSideRendering(book, str, outputFormat) {
    var GraphvizDotFile = book.config.get('pluginsConfig.' + PLUGIN_NAME + '.GraphvizDotFile');
    var PlantJar = book.config.get('pluginsConfig.' + PLUGIN_NAME + '.PlantJar');
    if (!PlantJar || !GraphvizDotFile) {
        throw "Please fullfill GraphvizDotFile and PlantJar in book.json"
    }
    const tmpFile = getTmp();
    return new Promise((resolve, reject) => {
        fs.writeFile(tmpFile, str, function (err) {
            if (err) {
                return console.log(err);
            }
            // run plantuml -help for more
            const args = [
                '-jar', PlantJar,
                // fixed x11 problems on CentOS
                '-Djava.awt.headless=true',
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
                    var svgFile = tmpFile + '.' + outputFormat;
                    fs.unlinkSync(tmpFile);
                    svg2img(book, svgFile).then(function (img) {
                        fs.unlinkSync(svgFile);
                        resolve(img)
                    });
                }
            });
        });
    })
}

function serverSideRendering(book, str, outputFormat) {
    var prefix = book.config.get('pluginsConfig.' + PLUGIN_NAME + '.Server');
    var realUrl = makeURL(prefix, str, outputFormat);
    return new Promise((resolve, reject) => {
        const tmpFile = getTmp();
        var svgFile = tmpFile + '.' + outputFormat;
        const fileInputStream = fs.createWriteStream(svgFile);
        http.get(realUrl, response => {
            var stream = response.pipe(fileInputStream);
            stream.on("finish", function() {
                svg2img(book, svgFile).then(function (img) {
                    fs.unlinkSync(svgFile);
                    resolve(img)
                });
            });
        });
    })
}

/**
 *
 * @param {String}str your uml string
 * @param book
 * @returns {Promise}
 * @private
 */
function _string2ImgAsync(str, book) {
    var isServerSide = book.config.get('pluginsConfig.' + PLUGIN_NAME + '.Render') === "PlantUMLServer";
    const outputFormat = book.generator === 'ebook' ? 'png' : 'svg';
    if (isServerSide){
        return serverSideRendering(book, str, outputFormat)
    }  else {
        return localSideRendering(book, str, outputFormat);
    }
}

module.exports = {
    blocks: {
        puml: {
            process: function (block) {
                var body = block.body;
                var src = block.kwargs.src;
                if (src) {
                    var relativeSrcPath = url.resolve(this.ctx.file.path, src)
                    var absoluteSrcPath = decodeURI(path.resolve(this.book.root, relativeSrcPath))
                    body = fs.readFileSync(absoluteSrcPath, 'utf8')
                }
                return _string2ImgAsync(body, this);
            }
        }
    }, hooks: {
        'page:before': async function processMermaidBlockList(page) {
            const mermaidRegex = /^```p(?:(?:lant)?)uml((.*[\r\n]+)+?)?```$/im;
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