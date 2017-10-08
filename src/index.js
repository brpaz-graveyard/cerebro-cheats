'use strict';

const icon = require('../assets/icon.png');
const cheatsManager = require('./cheatsManager');
const Preview = require('./Preview/preview');
const React = require('react');
const { shell } = require('electron');

/**
 * Plugin entrypoint
 */
const plugin = ({ term, display, actions }) => {

  const match = term.match(/cheats\s(.*)?/);

  if (match) {
    let filterTerm = match[1];
    let results = [{
      title: 'Open cheats directory',
      icon: icon,
      onSelect: (event) => {
        shell.openItem(cheatsManager.CHEATS_DIR);
      }
    }];

    cheatsManager.getCheats(filterTerm).then((data) => {

      data.forEach((item) => {
        results.push({
          id: item.path,
          title: item.name,
          icon: icon,
          getPreview: () => {
            return <Preview key={item.path} item={item} />
          },
          onSelect: (event) => {
            shell.openItem(item.path);
          }
        })
      });

      display(results);
    });

  }
}

const initialize = () => {
 cheatsManager.init();
}

module.exports = {
  fn: plugin,
  initialize: initialize,
  name: 'Cheat sheets',
  keyword: 'cheats',
  icon
};
