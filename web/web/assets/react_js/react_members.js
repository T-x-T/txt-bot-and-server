function MemberCardCountry(props){
  if(props.country){
    return (
      <>
        <p className="description"><br />Country: </p>
        <p className="value">{props.country}</p>
      </>
    );
  }else{
    return null;
  }
}

function MemberCardAge(props){
  if(props.age){
    return (
      <>
        <p className="description"><br />Age: </p>
        <p className="value">{props.age}</p>
      </>
    );
  }else{
    return null;
  }
}

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
            
            <MemberCardCountry country={this.props.country} />
            <MemberCardAge age={this.props.age} />

            <p className="description"><br />Playtime: </p>
            <p className="value">{this.props.playtime + 'h'}</p>

            <p className="description"><br />Date joined: </p>
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

      this.setState({
        members: res
      });
    });
  }

  sort(arr){
    return _internal.sortArray(arr, this.props.sort.split('.')[0], this.props.sort.split('.')[1]);
  }

  //Returns element if it matches the current searchTerm, null if not
  filter(member){
    if(typeof this.props.searchTerm != 'string'){
      return <MemberCard render_url={member.mc_render_url} mc_ign={member.mc_nick} discord_name={member.discord_nick} country={member.country} age={member.age} playtime={member.playtime} joined={new Date(member.joined_date).toISOString().substring(0, 10)} />;
    } else if (member.mc_nick.toLowerCase().includes(this.props.searchTerm)){
      return <MemberCard render_url={member.mc_render_url} mc_ign={member.mc_nick} discord_name={member.discord_nick} country={member.country} age={member.age} playtime={member.playtime} joined={new Date(member.joined_date).toISOString().substring(0, 10)} />;
    } else if (member.discord_nick.toLowerCase().includes(this.props.searchTerm)) {
      return <MemberCard render_url={member.mc_render_url} mc_ign={member.mc_nick} discord_name={member.discord_nick} country={member.country} age={member.age} playtime={member.playtime} joined={new Date(member.joined_date).toISOString().substring(0, 10)} />;
    } else if (typeof member.country == 'string' && member.country.toLowerCase().includes(this.props.searchTerm)) {
      return <MemberCard render_url={member.mc_render_url} mc_ign={member.mc_nick} discord_name={member.discord_nick} country={member.country} age={member.age} playtime={member.playtime} joined={new Date(member.joined_date).toISOString().substring(0, 10)} />;
    }else{
      return null;
    }
    
  }

  render(){
    let output;

    if(this.state.members){
      let members = this.sort(this.state.members);
      output = members.map((member) => {
        return this.filter(member);  
      });
    }else{
      output = (<p>Loading...</p>);
    }
    
    return output;
  }
}

function SearchIcons(props){
  if(props.textEntered){
    return (
      <div className="searchicon" onClick={() => props.onEmpty()}>
        <i className="fas fa-times"></i>
      </div>
    );
  }else{
    return (
      <div className="searchicon">
        <i className="fas fa-search"></i>
      </div>
    );
  }
};

class Search extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="search">
        <SearchIcons textEntered={typeof this.props.searchTerm == 'string' && this.props.searchTerm.length > 0 ? true : false} onEmpty={() => this.props.onSearch('')}/>
        <input type="text" id="searchInput" value={this.props.searchTerm} onChange={(e) => this.props.onSearch(e.target.value.toLowerCase())} placeholder="Search member…" />
      </div>
    );
  };
}

class Sort extends React.Component {
  constructor(props){
    super(props);

    this.options = [
      { value: 'joined_date.asc', label: 'Date joined ASC' },
      { value: 'joined_date.desc', label: 'Date joined DESC' },
      { value: 'playtime.asc', label: 'Playtime ASC' },
      { value: 'playtime.desc', label: 'Playtime DESC' },
      { value: 'age.asc', label: 'Age ASC'},
      { value: 'age.desc', label: 'Age DESC'},
      { value: 'mc_nick.asc', label: 'IGN ASC' },
      { value: 'mc_nick.desc', label: 'IGN DESC' },
      { value: 'discord_nick.asc', label: 'Discord ASC' },
      { value: 'discord_nick.desc', label: 'Discord DESC' },
    ];
  };

  handleChange(option){
    this.props.onSort(option.value);
  };

  render(){
    return (
      <Select defaultValue="joined_date.asc" onChange={(o) => this.handleChange(o)} options={this.options} />
    );
  }
}

class Members extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      searchTerm: '',
      sort: 'joined_date.asc'
    };
  }

  onSearch(term){
    this.setState({
      searchTerm: term
    });
  };

  onSort(sort){
    this.setState({
      sort: sort
    });
  };

  render(){
    return(
      <>
        <Search onSearch={(term) => this.onSearch(term)} searchTerm={this.state.searchTerm} />
        <Sort onSort={(sort) => this.onSort(sort)}/>
        <MemberList searchTerm={this.state.searchTerm} sort={this.state.sort} />
      </>
    );
  };
};

ReactDOM.render(
  <Members />,
 document.getElementById('members_root')
);