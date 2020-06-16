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
    this.update();
    this.state = {
      posts: null
    };
  };

  update(){
    _internal.send('post', false, 'GET', {public: true}, false, (status, res) => {
      if(status != 200){
        window.alert('Encountered error');
        console.log(res);
        return;
      }
      if(!Array.isArray(res) || res.length === 0){
        window.alert('No data received');
        return;
      }
      //Sort the array after the date
      res.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      this.setState({
        posts: res
      });
    });
  }

  render(){
    let output;
    if(this.state.posts){
      output = this.state.posts.map((post) => {
        return <Article title={post.title} author={post.author} date={post.date} body={post.body} />
      });
    }else{
      output = <p>Loading...</p>;
    }
    return output;
  };
};

ReactDOM.render(
 <Blog />,
 document.getElementById('blog_root')
);
