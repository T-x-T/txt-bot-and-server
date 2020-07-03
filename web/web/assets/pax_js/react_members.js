function MemberCardCountry(props) {
  if (props.country) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
      className: "description"
    }, /*#__PURE__*/React.createElement("br", null), "Country: "), /*#__PURE__*/React.createElement("p", {
      className: "value"
    }, props.country));
  } else {
    return null;
  }
}

function MemberCardAge(props) {
  if (props.age) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
      className: "description"
    }, /*#__PURE__*/React.createElement("br", null), "Age: "), /*#__PURE__*/React.createElement("p", {
      className: "value"
    }, props.age));
  } else {
    return null;
  }
}

class MemberCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "member-card-wrapper"
    }, /*#__PURE__*/React.createElement("div", {
      className: "member-card-image"
    }, /*#__PURE__*/React.createElement("img", {
      src: this.props.render_url,
      alt: "image not available"
    })), /*#__PURE__*/React.createElement("div", {
      className: "member-card-description"
    }, /*#__PURE__*/React.createElement("h2", null, this.props.mc_ign), /*#__PURE__*/React.createElement("h3", null, this.props.discord_name), /*#__PURE__*/React.createElement("div", {
      className: "member-card-infos"
    }, /*#__PURE__*/React.createElement(MemberCardCountry, {
      country: this.props.country
    }), /*#__PURE__*/React.createElement(MemberCardAge, {
      age: this.props.age
    }), /*#__PURE__*/React.createElement("p", {
      className: "description"
    }, /*#__PURE__*/React.createElement("br", null), "Playtime: "), /*#__PURE__*/React.createElement("p", {
      className: "value"
    }, this.props.playtime + 'h'), /*#__PURE__*/React.createElement("p", {
      className: "description"
    }, /*#__PURE__*/React.createElement("br", null), "Date joined: "), /*#__PURE__*/React.createElement("p", {
      className: "value"
    }, this.props.joined))));
  }

}

class MemberList extends React.Component {
  constructor(props) {
    super(props);
    this.update();
    this.state = {
      members: null
    };
  }

  update() {
    _internal.send('member', false, 'GET', false, false, (status, res) => {
      if (status != 200) {
        window.alert('An error occured');
        console.error(status, res);
        return;
      }

      if (!Array.isArray(res) || res.length === 0) {
        window.alert('No data received');
        return;
      }

      this.setState({
        members: res
      });
    });
  }

  sort(arr) {
    console.log(this.props.sort);
    return _internal.sortArray(arr, this.props.sort.split('.')[0], this.props.sort.split('.')[1]);
  } //Returns element if it matches the current searchTerm, null if not


  filter(member) {
    if (typeof this.props.searchTerm != 'string') {
      return /*#__PURE__*/React.createElement(MemberCard, {
        render_url: member.mc_render_url,
        mc_ign: member.mc_nick,
        discord_name: member.discord_nick,
        country: member.country,
        age: member.age,
        playtime: member.playtime,
        joined: new Date(member.joined_date).toISOString().substring(0, 10)
      });
    } else if (member.mc_nick.toLowerCase().includes(this.props.searchTerm)) {
      return /*#__PURE__*/React.createElement(MemberCard, {
        render_url: member.mc_render_url,
        mc_ign: member.mc_nick,
        discord_name: member.discord_nick,
        country: member.country,
        age: member.age,
        playtime: member.playtime,
        joined: new Date(member.joined_date).toISOString().substring(0, 10)
      });
    } else if (member.discord_nick.toLowerCase().includes(this.props.searchTerm)) {
      return /*#__PURE__*/React.createElement(MemberCard, {
        render_url: member.mc_render_url,
        mc_ign: member.mc_nick,
        discord_name: member.discord_nick,
        country: member.country,
        age: member.age,
        playtime: member.playtime,
        joined: new Date(member.joined_date).toISOString().substring(0, 10)
      });
    } else if (typeof member.country == 'string' && member.country.toLowerCase().includes(this.props.searchTerm)) {
      return /*#__PURE__*/React.createElement(MemberCard, {
        render_url: member.mc_render_url,
        mc_ign: member.mc_nick,
        discord_name: member.discord_nick,
        country: member.country,
        age: member.age,
        playtime: member.playtime,
        joined: new Date(member.joined_date).toISOString().substring(0, 10)
      });
    } else {
      return null;
    }
  }

  render() {
    let output;

    if (this.state.members) {
      let members = this.sort(this.state.members);
      output = members.map(member => {
        return this.filter(member);
      });
    } else {
      output = /*#__PURE__*/React.createElement("p", null, "Loading...");
    }

    return output;
  }

}

function SearchIcons(props) {
  if (props.textEntered) {
    return /*#__PURE__*/React.createElement("div", {
      className: "searchicon",
      onClick: () => props.onEmpty()
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-times"
    }));
  } else {
    return /*#__PURE__*/React.createElement("div", {
      className: "searchicon"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-search"
    }));
  }
}

;

class Search extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "search"
    }, /*#__PURE__*/React.createElement(SearchIcons, {
      textEntered: typeof this.props.searchTerm == 'string' && this.props.searchTerm.length > 0 ? true : false,
      onEmpty: () => this.props.onSearch('')
    }), /*#__PURE__*/React.createElement("input", {
      type: "text",
      id: "searchInput",
      value: this.props.searchTerm,
      onChange: e => this.props.onSearch(e.target.value.toLowerCase()),
      placeholder: "Search member\u2026"
    }));
  }

}

class Sort extends React.Component {
  constructor(props) {
    super(props);
    this.options = [{
      value: 'joined_date.asc',
      label: 'Date joined ASC'
    }, {
      value: 'joined_date.desc',
      label: 'Date joined DESC'
    }, {
      value: 'playtime.asc',
      label: 'Playtime ASC'
    }, {
      value: 'playtime.desc',
      label: 'Playtime DESC'
    }, {
      value: 'age.asc',
      label: 'Age ASC'
    }, {
      value: 'age.desc',
      label: 'Age DESC'
    }, {
      value: 'mc_nick.asc',
      label: 'IGN ASC'
    }, {
      value: 'mc_nick.desc',
      label: 'IGN DESC'
    }, {
      value: 'discord_nick.asc',
      label: 'Discord ASC'
    }, {
      value: 'discord_nick.desc',
      label: 'Discord DESC'
    }];
  }

  handleChange(option) {
    this.props.onSort(option.value);
  }

  render() {
    return /*#__PURE__*/React.createElement(Select, {
      defaultValue: "joined_date.asc",
      onChange: o => this.handleChange(o),
      options: this.options
    });
  }

}

class Members extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      sort: 'joined_date.asc'
    };
  }

  onSearch(term) {
    this.setState({
      searchTerm: term
    });
  }

  onSort(sort) {
    this.setState({
      sort: sort
    });
  }

  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Search, {
      onSearch: term => this.onSearch(term),
      searchTerm: this.state.searchTerm
    }), /*#__PURE__*/React.createElement(Sort, {
      onSort: sort => this.onSort(sort)
    }), /*#__PURE__*/React.createElement(MemberList, {
      searchTerm: this.state.searchTerm,
      sort: this.state.sort
    }));
  }

}

;
ReactDOM.render( /*#__PURE__*/React.createElement(Members, null), document.getElementById('members_root'));