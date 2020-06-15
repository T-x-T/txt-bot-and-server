class Article extends React.Component{
  constructor(props){
    super(props);
  };

  render(){
    return (
      <article className="news">
        <h2>{this.props.title}</h2>
        <img className="author" src={`assets/paxterya/img/avatar-${this.props.author.toLowerCase()}.png`} />
        <span className="subtitle">{new Date(this.props.date).toISOString().substring(0, 10)}. Author: {this.props.author}</span>
        <section><div dangerouslySetInnerHTML={{__html: this.props.body}} /></section>
      </article>
    );
  };
};

class Blog extends React.Component{
  constructor(props){
    super(props);
  };

  render(){
    return (
      <Article title="Test title" author="TxT" date={Date.now()} body="<h3>This is a title in the body</h3><p>And this is some more text</p>" />
    );
  };
};

ReactDOM.render(
 <Blog />,
 document.getElementById('blog_root')
);
