class MemberCard extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <div className="member-card-wrapper">
        <div className="member-card-image">
          <img src={this.props.render_url} alt="image not available" />
        </div>
        <div className="member-card-description">
          <h2>{this.props.mc_ign}</h2>
          <h3>{this.props.discord_name}</h3>

          <div className="member-card-infos">
            <p className="description"><br />Country:</p>
            <p className="value">{this.props.country}</p>

            <p className="description"><br />Age:</p>
            <p className="value">{this.props.age}</p>

            <p className="description"><br />Playtime:</p>
            <p className="value">{this.props.playtime}</p>

            <p className="description"><br />Date joined:</p>
            <p className="value">{this.props.joined}</p>
          </div>
        </div>
      </div>
    );
  }
}

class MemberList extends React.Component {
  constructor(props){
    super(props);
    this.update();
    this.state = {
      members: null
    };
  }

  update(){
    _internal.send('member', false, 'GET', false, false, (status, res) => {
      if(status != 200){
        window.alert('An error occured');
        console.error(status, res);
        return;
      }

      if(!Array.isArray(res) || res.length === 0){
        window.alert('No data received');
        return;
      }

      res = sort(res);

      this.setState = {
        members: res
      };
    });
  }

  sort(arr){
    return _internal.sortArray(arr, this.props.sort.split('.')[0], this.props.sort.split('.')[1]);
  }

  render(){
    let output;

    if(this.state.members){
      output = this.state.members.map((member) => {
        return (<MemberCard render_url={member.mc_render_url} mc_ign={member.mc_nick} discord_name={member.discord_nick} country={member.country} age={member.age} playtime={member.playtime} joined={new Date(member.joined_date).toISOString().substring(0, 10)}/>);
      });
    }else{
      output = (<p>Loading...</p>);
    }

    return output;
  }
}

class Members extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return(
      <MemberList sort="joined_date.asc" />
    );
  };
};

ReactDOM.render(
  <Members />,
 document.getElementById('members_root')
);