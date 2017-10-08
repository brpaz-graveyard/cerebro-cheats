'use strict';

const path = require('path');
const fs = require('fs-extra');
const readdir = require('fs-readdir-promise');
const capitalize = require('capitalize');
const { remote } = require('electron');
const { memoize } = require('cerebro-tools');
const types = require('./cheatTypes');

/**
 * @type {string}
 */
const CHEATS_DIR = path.join(remote.app.getPath('userData'), 'plugins', 'cerebro-cheats', 'cheats');

/**
 * @type {array}
 */
const SUPPORTED_FILE_TYPES = ['md', 'markdown', 'html','jpg', 'png'];

/**
 * Memoize settings.
 * @type {object}
 */
const MEMOIZE_OPTIONS = {
  promise: 'then',
  maxAge: 60 * 5000, // 5 minute
  preFetch: true
}

/**
 * Returns a list of available cheat sheets, optionally filtered by term.
 * @param {string} term
 * @return {array}
 */
const getCheats = memoize((term) => {
  return new Promise((resolve, reject) => {
    let filesList = [];
    readdir(CHEATS_DIR)
      .then(function (files) {
        files.forEach(file => {
          let fileData = mapFile(file);
          if (fileData) {

            if (term && !fileData.name.toLowerCase().includes(term.toLowerCase())) {
              return false;
            }

            filesList.push(fileData);
          }
        });
        resolve(filesList);
      })
      .catch(function (err) {
        reject(err);
      });
  });
}, MEMOIZE_OPTIONS);

/**
 * Map file info into a structure usable by the application
 * @param {string} file
 * @return {object} File Info
 */
const mapFile = (file) => {
  let filename = file.split('.');
  let fileExt = filename.pop();
  let filepath = path.join(CHEATS_DIR, file);

  // Ignore any files that dont match our supported file formats.
  if (!SUPPORTED_FILE_TYPES.includes(fileExt)) {
    return false;
  }

  return {
    'name': capitalize(filename[0].replace(/\_|\-/g, ' ')),
    'type': getCheatTypeFromFileExtension(fileExt),
    'path': filepath
  };
}

/**
 * Returns the cheat sheet type based on the file extension.
 * @param {string} ext File Extension
 * @return {string}
 */
const getCheatTypeFromFileExtension = (ext) => {
  let type = types.FORMAT_TEXT;
  switch (ext) {
    case 'md':
    case 'markdown':
      type = types.FORMAT_MARKDOWN;
      break;
    case 'html':
      type = types.FORMAT_HTML;
      break;
    case 'jpg':
    case 'png':
      type = types.FORMAT_IMAGE;
      break;
    default:
      throw new Error("Invalid cheat type");
      break;
  }

  return type;
}

/**
 * Init function
 */
const init = () => {
  return fs.ensureDirSync(CHEATS_DIR);
}

module.exports = {
  init,
  getCheats,
  CHEATS_DIR
}
