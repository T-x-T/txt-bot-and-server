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
    this.update();
    this.state = {
      posts: null
    };
  }

  update() {
    _internal.send('blog', false, 'GET', {
      public: true
    }, false, (status, res) => {
      if (status != 200) {
        window.alert('Encountered error: ' + res.err);
        return;
      }

      if (!Array.isArray(res) || res.length === 0) {
        window.alert('No data received');
        return;
      } //Sort the array after the date


      res.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      this.setState({
        posts: res
      });
    });
  }

  render() {
    let output;

    if (this.state.posts) {
      output = this.state.posts.map(post => {
        return /*#__PURE__*/React.createElement(Article, {
          title: post.title,
          author: post.author,
          date: post.date,
          body: post.body
        });
      });
    } else {
      output = /*#__PURE__*/React.createElement("p", null, "Loading...");
    }

    return output;
  }

}

;
ReactDOM.render( /*#__PURE__*/React.createElement(Blog, null), document.getElementById('blog_root'));