const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

function DisplayHomepage() {
  return (
    <h1>Hi There! This is the Ticket to Ride 🚆. SG High-Speed Intercontinental Railway Reservation System.</h1>
  )
}

class AddTraveler extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.AddTraveler;
    const traveler = {
      name: form.name.value, phone: form.phone.value,
    }
    this.props.addTraveler(traveler);
    form.name.value = ""; form.phone.value = "";
  }

  render() {
    return (
      <form name="AddTraveler" onSubmit={this.handleSubmit}>
        <input type="text" name="name" placeholder="Name" required />
        <input type="text" name="phone" placeholder="Phone" required />
        <button>Add</button>
      </form>
    );
  }
}

class DeleteTraveler extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.DeleteTraveler;
    this.props.deleteTraveler(parseInt(form.id.value));
    form.id.value = "";
  }

  render() {
    return (
      <form name="DeleteTraveler" onSubmit={this.handleSubmit}>
        <input type="text" id="id" placeholder="Uid" required />
        <button>Delete</button>
      </form>
    );
  }
}

function TravelerRow(props) {
  const traveler = props.traveler;
  return (
    <tr>
      <td>{traveler.id}</td>
      <td>{traveler.name}</td>
      <td>{traveler.phone}</td>
    </tr>
  );
}

function DisplayTraveler(prop) {
  const TravelerRows = prop.travelers.map(traveler =>
    <TravelerRow key={traveler.id} traveler={traveler} />
  );

  return (
    <table className="bordered-table">
      <thead>
        <tr>
          <th>Uid</th>
          <th>Name</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>
        {TravelerRows}
      </tbody>
    </table>
  );
}

class BlackListAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.BlackList;
    const name = form.name.value;

    const query = `mutation mycreateBlackList($name: String!) {
      createBlackList(name: $name)
    }`;

    const data = await graphQLFetch(query, { name });
    form.name.value = "";
  }

  render() {
    return (
      <form name="BlackList" onSubmit={this.handleSubmit}>
        <input type="text" name="name" placeholder="Name" required />
        <button>Add</button>
      </form>
    );
  }
}


class ReservationPage extends React.Component {
  constructor() {
    super();
    this.state = { travelers: [], bannedTravelers: [], page: "DisplayHomepage" };
    this.addTraveler = this.addTraveler.bind(this);
    this.deleteTraveler = this.deleteTraveler.bind(this);
    this.handleHomeClick = this.handleHomeClick.bind(this);
    this.handleAddTravelerClick = this.handleAddTravelerClick.bind(this);
    this.handleDeleteTravelerClick = this.handleDeleteTravelerClick.bind(this);
    this.handleDisplayTravelerClick = this.handleDisplayTravelerClick.bind(this);
    this.handleAddBlackListClick = this.handleAddBlackListClick.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      travelerList {
        id name phone created
      }
    }`;
    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ travelers: data.travelerList });
    }
  }

  async addTraveler(traveler) {
    const query = `mutation travelerAdd($traveler: TravelerInputs!) {
      travelerAdd(traveler: $traveler){
        id
      }
    }`;
    const data = await graphQLFetch(query, { traveler });
    if (!data.errors) {
      this.loadData();
    }
  }

  async deleteTraveler(id) {
    const query = `mutation travelerDelete($id: Int!) {
      travelerDelete(id: $id){
        id
      }
    }`;
    const data = await graphQLFetch(query, { id });
    if (!data.error) {
      this.loadData();
    }
  }

  handleHomeClick() {
    this.setState({ page: "DisplayHomepage" });
  }
  handleAddTravelerClick() {
    this.setState({ page: "AddTraveler" });
  }
  handleDeleteTravelerClick() {
    this.setState({ page: "DeleteTraveler" });
  }
  handleDisplayTravelerClick() {
    this.setState({ page: "DisplayTraveler" });
  }
  handleAddBlackListClick() {
    this.setState({ page: "AddBlackList" });
  }

  render() {
    let NavigationBar =
      <>
        <button onClick={this.handleHomeClick}>Home</button>
        <button onClick={this.handleAddTravelerClick}>Add Traveler</button>
        <button onClick={this.handleDeleteTravelerClick}>Delete Traveler</button>
        <button onClick={this.handleDisplayTravelerClick}>Display Traveler</button>
        <button onClick={this.handleAddBlackListClick}>Add Blacklist</button>
      </>

    let DispalyPage = null;
    let page = this.state.page;
    if (page === "DisplayHomepage") {
      DispalyPage = <DisplayHomepage />;
    } else if (page === "AddTraveler") {
      DispalyPage = <AddTraveler addTraveler={this.addTraveler} />;
    } else if (page === "DeleteTraveler") {
      DispalyPage = <DeleteTraveler deleteTraveler={this.deleteTraveler} />;
    } else if (page === "DisplayTraveler") {
      DispalyPage = <DisplayTraveler travelers={this.state.travelers} />;
    } else if (page === "AddBlackList") {
      DispalyPage = <BlackListAdd />;
    }

    return (
      <>
        {NavigationBar}
        <hr />
        {DispalyPage}
      </>
    );
  }
}

const element = <ReservationPage />;

ReactDOM.render(element, document.getElementById('contents'));
