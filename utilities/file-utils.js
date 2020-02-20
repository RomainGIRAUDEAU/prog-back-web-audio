const fs = require('fs');
const path = require('path');


function writeFileSyncRecursive(filename, content) {
    filename = filename.split('\\').join(path.sep);
    const folders = filename.split(path.sep).slice(0, -1)
    if (folders.length) {
        // create folder path if it doesn't exist
        folders.reduce((last, folder) => {
            const folderPath = last ? last + path.sep + folder : folder
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath)
            }
            return folderPath
        })
    }
    fs.writeFileSync(filename, content, { flag: 'wx' }, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }

}


module.exports = {
    writeFileSyncRecursive,
    deleteFolderRecursive,
    fs,
    path
}