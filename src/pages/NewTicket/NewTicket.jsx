import React, { useState } from "react";
import { useEffect } from "react";
import "./NewTicket.css";

const NewTicket = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    CallNo: "CST/24-25/",
    CustomerType: "Individual",
    LogDate: "",
    CallType: "AMC",
    CustomerMobileNumber: "",
    CustomerName: "",
    Address: "",
    CompanyName: "",
    CompanyGSTNumber: "",
    ProductName: "",
    ProductModel: "",
    ProductSerialNumber: "",
    IssueDescription: "",
    CustomerComments: "",
    Engineer: "",
    Status: "Pending",
  });

  const [storedData, setStoredData] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "CustomerMobileNumber") {
      fetchSuggestions(value);
    }
  };

  const fetchSuggestions = async (input) => {
    if (input.length >= 1) {
      try {
        const response = await fetch(`http://localhost:3000/customer-suggestions/${input}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (customer) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      CustomerMobileNumber: customer.CustomerMobileNumber || "",
      CustomerName: customer.CustomerName || "",
      Address: customer.Address || "",
      CompanyName: customer.CompanyName || "",
      CompanyGSTNumber: customer.CompanyGSTNumber || ""
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    let lastCallNumber = "CST/24-25/000";

    if (storedData.length > 0) {
      const lastEntry = storedData[storedData.length - 1];
      if (lastEntry && lastEntry.CallNo) {
        lastCallNumber = lastEntry.CallNo;
      }
    }

    let lastNumber = parseInt(lastCallNumber.split("/").pop(), 10) || 0;
    let newNumber = (lastNumber + 1).toString().padStart(3, "0");
    let newCallNumber = `CST/24-25/${newNumber}`;

    const updatedFormData = { ...formData, CallNo: newCallNumber };

    try {
      const response = await fetch("http://localhost:3000/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });
      setShowSuccess(true);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save ticket. Check console for details.");
    }

    const newData = [...storedData, updatedFormData];
    setStoredData(newData);

    setShowPopup(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    setFormData({
      ...updatedFormData,
      LogDate: "",
      CallType: "AMC",
      CustomerMobileNumber: "",
      CustomerName: "",
      Address: "",
      CompanyName: "",
      CompanyGSTNumber: "",
      ProductName: "",
      ProductModel: "",
      ProductSerialNumber: "",
      IssueDescription: "",
      CustomerComments: "",
      Engineer: "",
      Status: "Pending",
      CallNo: `CST/24-25/${(parseInt(newNumber) + 1).toString().padStart(3, "0")}`,
    });
  };

  const show = () => {
    setShowPopup(true);
  };

  return (
    <div className="new-ticket-container">
      <div className="ticketcontainer">
        <div className="header">
          <h3>New Ticket</h3>
        </div>

        {/* Form Section */}
        <div className="sections input-group-container">
          <div className="input-group">
            <label>Select Customer Type</label>
            <select name="CustomerType" value={formData.CustomerType} onChange={handleChange}>
              <option>Individual</option>
              <option>Company</option>
            </select>
          </div>
          <div className="input-group">
            <label>Log Date</label>
            <input type="date" name="LogDate" value={formData.LogDate} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Mobile Number</label>
            <input
              type="number"
              name="CustomerMobileNumber"
              placeholder="Mobile Number"
              value={formData.CustomerMobileNumber}
              onChange={handleChange}
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((customer, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(customer)}
                  >
                    {customer.CustomerMobileNumber} - {customer.CustomerName}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="input-group">
            <label>Service Type</label>
            <select name="CallType" value={formData.CallType} onChange={handleChange}>
              <option>AMC</option>
              <option>PERCALL</option>
            </select>
          </div>
        </div>

        {/* Customer Details */}
        <div className="sections">
          <h3>Customer Details</h3>
          <div className="customer-details">
            <input type="number" name="CustomerMobileNumber" placeholder="Customer Mobile Number" value={formData.CustomerMobileNumber} onChange={handleChange} />
            <input type="text" name="CustomerName" placeholder="Customer Name" value={formData.CustomerName} onChange={handleChange} />
            <input type="text" name="Address" placeholder="Customer Address" value={formData.Address} onChange={handleChange} />
            <input type="text" name="CompanyName" placeholder="Company Name" value={formData.CompanyName} onChange={handleChange} />
            <input type="text" name="CompanyGSTNumber" placeholder="Company GST Number" value={formData.CompanyGSTNumber} onChange={handleChange} />
          </div>
        </div>

        {/* Product Details */}
        <div className="sections">
          <h3>Product Details</h3>
          <div className="product-details">
            <input type="text" name="ProductName" placeholder="Product Name" value={formData.ProductName} onChange={handleChange} />
            <input type="text" name="ProductModel" placeholder="Product Model" value={formData.ProductModel} onChange={handleChange} />
            <input type="text" name="ProductSerialNumber" placeholder="Product Serial Number" value={formData.ProductSerialNumber} onChange={handleChange} />
          </div>
        </div>

        {/* Issue Description & Comments */}
        <div className="sections section5">
          <div className="column">
            <h5>Issue Description</h5>
            <textarea name="IssueDescription" placeholder="Enter the Product Issue" value={formData.IssueDescription} onChange={handleChange}></textarea>
          </div>
          <div className="column">
            <h5>Customer Comments</h5>
            <textarea name="CustomerComments" placeholder="Enter the Customer Comment" value={formData.CustomerComments} onChange={handleChange}></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sections">
          <button className="submit-button" onClick={show}>Submit</button>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Submitted Details</h3>
            <table border="1px" className="details-table">
              <tbody>
                <tr><th>Customer Type</th><td>{formData.CustomerType}</td></tr>
                <tr><th>Log Date</th><td>{formData.LogDate}</td></tr>
                <tr><th>Customer Mobile</th><td>{formData.CustomerMobileNumber}</td></tr>
                <tr><th>Customer Name</th><td>{formData.CustomerName}</td></tr>
                <tr><th>Customer Address</th><td>{formData.Address}</td></tr>
                <tr><th>Company Name</th><td>{formData.CompanyName}</td></tr>
                <tr><th>Company GST</th><td>{formData.CompanyGSTNumber}</td></tr>
                <tr><th>Service Type</th><td>{formData.CallType}</td></tr>
                <tr><th>Product Name</th><td>{formData.ProductName}</td></tr>
                <tr><th>Product Model</th><td>{formData.ProductModel}</td></tr>
                <tr><th>Product Serial</th><td>{formData.ProductSerialNumber}</td></tr>
                <tr><th>Issue Description</th><td>{formData.IssueDescription}</td></tr>
                <tr><th>Customer Comments</th><td>{formData.CustomerComments}</td></tr>
              </tbody>
            </table>
            <div className="buttons">
              <button className="save-button" onClick={handleSubmit}>Save</button>
              <button className="close-button" onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {showSuccess && (
        <div className="success-animation success_popup">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default NewTicket;
