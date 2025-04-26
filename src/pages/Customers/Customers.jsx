import React, { useEffect, useState } from 'react';

const Customers = () => {
  const [storedData, setStoredData] = useState([]);
  const [filters, setFilters] = useState({
    CustomerMobileNumber: "",
    CustomerType: "",
    CustomerName: "",
    CompanyName: "",
    Address: "",
    CompanyGSTNumber: "",
  });

 /* useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("datas")) || [];
    setStoredData(Array.isArray(savedData) ? savedData : []);
  }, []);*/

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/customers");
        const data = await response.json();
        setStoredData(data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };
  
    fetchCustomers();
  }, []);
  

  // Function to filter data dynamically
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredData = storedData.filter((data) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      if (!data[key]) return false;

      const dataValue = data[key]?.toString().toLowerCase();
      const filterValue = filters[key]?.toString().toLowerCase();

      return dataValue.includes(filterValue);
    });
  });

  return (
    <div className="dashboard1 customers_page">
      <div className="header">
        <h1>Customers</h1>
        <button id="c-button" className="create-ticket">Add Customers</button>
      </div>

      <div className="data-table">
        <h3>Stored Data (Data Table)</h3>

        <table border="1">
          <thead>
            <tr className="filter_row">
              <th>S.No</th>
              <th><input type="text" name="CustomerMobileNumber" placeholder="Mobile Number" onChange={handleFilterChange} /></th>
              <th><input type="text" name="CustomerType" placeholder="Customer Type" onChange={handleFilterChange} /></th>
              <th><input type="text" name="CustomerName" placeholder="Customer Name" onChange={handleFilterChange} /></th>
              <th><input type="text" name="CompanyName" placeholder="Company Name" onChange={handleFilterChange} /></th>
              <th><input type="text" name="Address" placeholder="Address" onChange={handleFilterChange} /></th>
              <th><input type="text" name="CompanyGSTNumber" placeholder="GST Number" onChange={handleFilterChange} /></th>
            </tr>
            <tr>
              <th>S.No</th>
              <th>Mobile Number</th>
              <th>Customer Type</th>
              <th>Customer Name</th>
              <th>Company Name</th>
              <th>Customer Address</th>
              <th>GST Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.CustomerMobileNumber}</td>
                  <td>{data.CustomerType}</td>
                  <td>{data.CustomerName}</td>
                  <td>{data.CompanyName}</td>
                  <td>{data.Address}</td>
                  <td>{data.CompanyGSTNumber}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", fontWeight: "bold", color: "red" }}>
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
