class Article extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("article", {
      className: "news"
    }, /*#__PURE__*/React.createElement("h2", null, this.props.title), /*#__PURE__*/React.createElement("img", {
      className: "author",
      src: `assets/paxterya/img/avatar-${this.props.author.toLowerCase()}.png`
    }), /*#__PURE__*/React.createElement("span", {
      className: "subtitle"
    }, new Date(this.props.date).toISOString().substring(0, 10), ". Author: ", this.props.author), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: this.props.body
      }
    })));
  }

}

;

class Blog extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement(Article, {
      title: "Test title",
      author: "TxT",
      date: Date.now(),
      body: "<h3>This is a title in the body</h3><p>And this is some more text</p>"
    });
  }

}

;
ReactDOM.render( /*#__PURE__*/React.createElement(Blog, null), document.getElementById('blog_root'));