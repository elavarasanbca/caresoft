import { useState } from "react";
import "./App.css";
import Navbar from "./layouts/Navbar/Navbar.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import NewTicket from "./pages/NewTicket/NewTicket.jsx";
import Customers from "./pages/Customers/Customers.jsx";


// Store components in an object
const pages = {
  Dashboard: Dashboard,
  "New Ticket": NewTicket,
  "Customers" : Customers

};

function App() {
  const [activePage, setActivePage] = useState("Dashboard"); // Default Page

  // Get the correct component dynamically
  const PageComponent = pages[activePage];

  return (
    <div className="App">
      <Navbar setActivePage={setActivePage} />
      <div className="content">
         {/* Pass setActivePage as a prop to allow navigation */}
         {PageComponent && <PageComponent setActivePage={setActivePage} />}
      </div>
    </div>
  );
}

export default App;
