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
    }, /*#__PURE__*/React.createElement("p", {
      className: "description"
    }, /*#__PURE__*/React.createElement("br", null), "Country:"), /*#__PURE__*/React.createElement("p", {
      className: "value"
    }, this.props.country), /*#__PURE__*/React.createElement("p", {
      className: "description"
    }, /*#__PURE__*/React.createElement("br", null), "Age:"), /*#__PURE__*/React.createElement("p", {
      className: "value"
    }, this.props.age), /*#__PURE__*/React.createElement("p", {
      className: "description"
    }, /*#__PURE__*/React.createElement("br", null), "Playtime:"), /*#__PURE__*/React.createElement("p", {
      className: "value"
    }, this.props.playtime), /*#__PURE__*/React.createElement("p", {
      className: "description"
    }, /*#__PURE__*/React.createElement("br", null), "Date joined:"), /*#__PURE__*/React.createElement("p", {
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

      res = this.sort(res);
      this.setState({
        members: res
      });
    });
  }

  sort(arr) {
    return _internal.sortArray(arr, this.props.sort.split('.')[0], this.props.sort.split('.')[1]);
  }

  render() {
    let output;

    if (this.state.members) {
      output = this.state.members.map(member => {
        return /*#__PURE__*/React.createElement(MemberCard, {
          render_url: member.mc_render_url,
          mc_ign: member.mc_nick,
          discord_name: member.discord_nick,
          country: member.country,
          age: member.age,
          playtime: member.playtime,
          joined: new Date(member.joined_date).toISOString().substring(0, 10)
        });
      });
    } else {
      output = /*#__PURE__*/React.createElement("p", null, "Loading...");
    }

    return output;
  }

}

class Members extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement(MemberList, {
      sort: "joined_date.asc"
    });
  }

}

;
ReactDOM.render( /*#__PURE__*/React.createElement(Members, null), document.getElementById('members_root'));