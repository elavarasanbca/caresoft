import React, { useEffect, useState } from "react";
import "../Dashboard/Dash.css";
import PopupModel from "../../components/PopupModel/PopupModel.jsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import excel from "../../assets/Images/excel.png"
import pdf from "../../assets/Images/pdf.png"


const Dashboard = ({ setActivePage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedDataIndex, setSelectedDataIndex] = useState(null);

  const [storedData, setStoredData] = useState([]);
  const [filters, setFilters] = useState({
    CallNo :"",
    LogDate: "",
    CustomerType: "",
    Status: "",
    CustomerMobileNumber: "",
    CustomerName: "",
    CallType: "",
    ProductName: "",
    ProductModel: "",
    ProductSerial: "",
    Engineer: "",
  });
  const totalCount = storedData.length;

  const completedCount = storedData.filter(data => data.Status === "Completed").length;
  const pendingCount = storedData.filter(data => data.Status === "Pending").length;
  const inhouseCount = storedData.filter(data => data.Status === "Inhouse").length;

  const exportToPDF = () => {
      const doc = new jsPDF();
      doc.text("Filtered Data Report", 10, 10);
      
      const tableColumn = [
        "Call Number", "Log Date", "Customer Type", "Call Status", "Mobile", 
        "Customer Name", "Service Type", "Product Name", "Product Model", 
        "Product Serial", "Assigned Engineer"
      ];
  
      const tableRows = filteredData.map(data => [
        data.callNumber, data.logDate, data.customerType, data.callStatus, 
        data.mobileNumber, data.customerName, data.serviceType, data.productName, 
        data.productModel, data.productSerial, data.assignEngineer
      ]);
    
      doc.autoTable({ head: [tableColumn], body: tableRows });
      doc.save("FilteredData.pdf");
    };
  
    



    const exportToExcel = () => {
      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");
      XLSX.writeFile(wb, "FilteredData.xlsx");
    };
  
  // Load stored data from Local Storage on component mount
  /*useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("datas")) || [];
    setStoredData(savedData);
  }, []);*/

//fetch data
useEffect(() => {
  const fetchData = async () => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`http://localhost:3000/tickets?${queryParams}`);
    const data = await response.json();
    setStoredData(data);
  };

  fetchData();
}, [filters]);
//filter
const handleFilterChange = (e) => {
  const { name, value } = e.target;
  setFilters((prevFilters) => ({
    ...prevFilters,
    [name]: value,
  }));
};



  // Function to update assigned engineer
  const assignEngineer = async (index, Engineer) => {
    const updatedTickets = [...storedData];
    const sno = updatedTickets[index].SNo;  // Get SNo instead of CallType
  
    updatedTickets[index].Engineer = Engineer;
    setStoredData(updatedTickets);
  
    try {
      await fetch(`http://localhost:3000/tickets/${sno}/assign-engineer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Engineer: Engineer }),  // Send Engineer name
      });
    } catch (error) {
      console.error("Error updating engineer:", error);
    }
  };
  


  
// Dashboard.jsx (React)

const updateCallStatus = async (index, newStatus) => {
  const updatedTickets = [...storedData];
  const updatedTicket = { ...updatedTickets[index], Status: newStatus };
  updatedTickets[index] = updatedTicket;
  setStoredData(updatedTickets);

  const sno = updatedTicket.SNo; // Ensure SNo is coming from database

  try {
    const response = await fetch(`http://localhost:3000/tickets/${sno}/update-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Status: newStatus }),
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    console.log('Status updated successfully');
    // Optionally show a success notification here
  } catch (error) {
    console.error('Error updating status:', error);
    // Optionally show an error notification here
  }
};


 //Function to popup
 const showpopup = (index) => {
  setSelectedDataIndex(index);
  setIsModalOpen(true);
}; 

  // Function to determine background color based on call status
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#ff9800"; // Orange
      case "Completed":
        return "#4caf50"; // Green
      case "Inhouse":
        return "#9c27b0"; // Purple
      default:
        return "white"; // Default
    }
  };

  
  const [Engineer, setEngineers] = useState([]);

useEffect(() => {
  const fetchEngineers = async () => {
    try {
      const response = await fetch("http://localhost:3000/engineers");
       // Make sure this matches your backend endpoint
      const data = await response.json();
      setEngineers(data);
      
    } catch (error) {
      console.error("Error fetching engineers:", error);
    }
  };

  fetchEngineers();
}, []);

  
  // Filtering logic: Ensure table does not disappear
  const filteredData = storedData.filter((data) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true; // If no filter is applied, show all data
      if (!data[key]) return false; // If data is undefined, skip

      const dataValue = data[key]?.toString().toLowerCase();
      const filterValue = filters[key]?.toString().toLowerCase();

      return dataValue.includes(filterValue);
    });
  });

  

  
  return (
    
    <>
      <div className="dashboard1">
        <div className="header">
          <h1>Dashboard</h1>
          <button
            id="c-button"
            onClick={() => setActivePage("New Ticket")}
            className="create-ticket"
          >
            Create New Ticket
          </button>
        </div>
        <div class="stats">
            <div class="stat-box t1">
              <div class="stat-icon total-icon"></div>
              <h3>Total Calls</h3>
              <p>{totalCount}</p>
            </div>
            <div class="stat-box t2 ">
              <div class="stat-icon pending-icon"></div>
              <h3>Pending Calls</h3>
              <p>{pendingCount}</p>
            </div>
            <div class="stat-box t3 ">
              <div class="stat-icon completed-icon"></div>
              <h3>Completed Calls</h3>
              <p>{completedCount}</p>
            </div>
            <div class="stat-box t4 ">
              <div class="stat-icon inhouse-icon"></div>
              <h3>Inhouse Calls</h3>
              <p>{inhouseCount}</p>
            </div>
            </div>

        <div className="data-table">
          <h3>Stored Data (Datas Table)</h3>

          {/* Export Buttons */}
          <div className="containers">
    <div className="exports">
    <img src={excel} onClick={exportToExcel} alt="Excel logo here"  />
    {/*<img src={pdf} onClick={exportToPDF} alt="Excel logo here"  />*/}
    </div>
    </div>
          {/* Table Always Visible */}
          <table border="1">
            <thead>
              <tr className="filter_row">
                
            <th><input type="text" name="CallNo" placeholder= "CallNo" onChange={handleFilterChange} /> </th>
            <th><input type="date" name="LogDate" onChange={handleFilterChange} /> </th>
            <th><input type="text" name="CustomerType" placeholder="CustomerType" onChange={handleFilterChange} /></th>
            <th><input type="text" name="Status" placeholder="Status" onChange={handleFilterChange} /></th>
            <th><input type="text" name="CustomerMobileNumber" placeholder="CustomerMobileNumber" onChange={handleFilterChange} /></th>
            <th><input type="text" name="CustomerName" placeholder="CustomerName" onChange={handleFilterChange} /></th>
            <th><input type="text" name="CallType" placeholder="CallType" onChange={handleFilterChange} /></th>
            <th> <input type="text" name="ProductName" placeholder="ProductName" onChange={handleFilterChange} /></th>
            <th><input type="text" name="ProductModel" placeholder="ProductModel" onChange={handleFilterChange} /></th>
            <th><input type="text" name="ProductSerialNumber" placeholder="ProductSerialNumber" onChange={handleFilterChange} /></th>
            <th><input type="text" name="Engineer" placeholder="Engineer" onChange={handleFilterChange} /></th>
            
            </tr>
              <tr>

                <th>Call Number</th>
                <th>Log Date</th>
                <th>Customer Type</th>
                <th>Call Status</th>
                <th>Mobile</th>
                <th>Customer Name</th>
                <th>Service Type</th>
                <th>Product Name</th>
                <th>Product Model</th>
                <th>Product Serial</th>
                <th>Assigned Engineer</th>
              </tr>
            </thead>
            <tbody>
  {filteredData.length > 0 ? (
    filteredData.map((data, index) => (
      <tr key={index} onDoubleClick={()=>showpopup(index)}>
        <td>{data.CallNo}</td>
        <td>{data.LogDate}</td>
        <td>{data.CustomerType}</td>
        <td
          style={{
            backgroundColor: getStatusColor(data.Status),
            color: "white",
            fontWeight: "bold", 
            textAlign: "center",
          }}
          onClick={() => updateCallStatus(index, "")}
        >
          {data.Status ? (
            <span>{data.Status}</span>
          ) : (
            <select onChange={(e) => updateCallStatus(index, e.target.value)}>
              <option value="">Update Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Inhouse">Inhouse</option>
            </select>
          )}
        </td>
        <td>{data.CustomerMobileNumber}</td>
        <td>{data.CustomerName}</td>
        <td>{data.CallType}</td>
        <td>{data.ProductName}</td>
        <td>{data.ProductModel}</td>
        <td>{data.ProductSerialNumber}</td>
        <td onClick={() => assignEngineer(index, "")}>
          {data.Engineer ? (
            <span>{data.Engineer || "Unassigned"}</span>
          ) : (
            <select onChange={(e) => assignEngineer(index, e.target.value)}>
              <option value="">Assign Engineer</option>
              {Engineer.map((engineer) => (
                <option key={engineer.id} value={engineer.FirstName}>
                  {engineer.FirstName}
                </option>
              ))}
            </select>
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="10" style={{ textAlign: "center", fontWeight: "bold", color: "red" }}>
        No matching records found
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
        {/* UPDATED STARTED FROM 20/04/2025 */}
                <PopupModel
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={storedData[selectedDataIndex]}
          onUpdate={(updatedData) => {
            const updatedArray = [...storedData];
            updatedArray[selectedDataIndex] = updatedData;
            setStoredData(updatedArray);
            localStorage.setItem("datas", JSON.stringify(updatedArray));
          }}
        />
         {/* UPDATED STARTED FROM 20/04/2025 */}
      </div>
    </>
  );
};

export default Dashboard;
