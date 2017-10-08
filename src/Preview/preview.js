const React = require('react');
const types = require('../cheatTypes');
const styles = require('./styles.css');
const fs = require('fs');
const Remarkable = require('remarkable');
const hljs = require('highlight.js');

class Preview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: props.item
    }

    this.md = new Remarkable({
      html: true,        // Enable HTML tags in source
      breaks: true,        // Convert '\n' in paragraphs into <br>
      langPrefix: 'language-',  // CSS language prefix for fenced blocks
      linkify: true,        // Autoconvert URL-like text to links
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, str).value;
          } catch (err) { }
        }

        try {
          return hljs.highlightAuto(str).value;
        } catch (err) { }

        return ''; // use external default escaping
      }
    });
  }

  render() {

    switch (this.state.item.type) {
      case types.FORMAT_IMAGE:
        return (
          <div style={{ height: '100%', marginTop: '30px' }}>
            <img src={this.state.item.path} />
          </div>
        )
      case types.FORMAT_HTML:
        return <div style={{ height: '100%', marginTop: '30px' }} dangerouslySetInnerHTML={{ __html: fs.readFileSync(this.state.item.path, 'utf8').toString() }}></div>
      case types.FORMAT_MARKDOWN:
        let content = fs.readFileSync(this.state.item.path, 'utf8').toString();
        return (
          <div style={{ height: '100%', marginTop: '30px' }} dangerouslySetInnerHTML={{ __html: this.md.render(content) }}></div>
        )
      default:
        return 'Unsupported file type';
        break;
    }
  }
}

module.exports = Preview
