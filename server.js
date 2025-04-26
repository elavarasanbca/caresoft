const express = require("express");
const sql = require("mssql");
const router = express.Router();
const cors = require("cors");
const twilio = require("twilio");
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());


const dbConfig = {
    user: "sa",
    password: "p@ssw0rd",
    server: "localhost",
    database: "CallCreate",
    options: { encrypt: false, trustServerCertificate: true },
};

// Insert Ticket
app.post("/ticket", async (req, res) => {
    try {
        await sql.connect(dbConfig);

        const {
            Engineer, CallNo, Status, CompanyGSTNumber, CompanyName,
            Address, CustomerComments, CustomerName,
            CustomerType, IssueDescription, LogDate, CustomerMobileNumber,
            ProductModel, ProductName, ProductSerialNumber, CallType
        } = req.body;

        const query = `
            INSERT INTO Ticket (Engineer, CallNo, Status, CompanyGSTNumber, CompanyName, 
                               Address, CustomerComments, CustomerMobileNumber, CustomerName, 
                                CustomerType, IssueDescription, LogDate,
                                ProductModel, ProductName, ProductSerialNumber, CallType) 
            VALUES (@Engineer, @CallNo, @Status, @CompanyGSTNumber, @CompanyName, 
                    @Address, @CustomerComments, @CustomerMobileNumber, @CustomerName, 
                    @CustomerType, @IssueDescription, @LogDate,
                    @ProductModel, @ProductName, @ProductSerialNumber, @CallType);
        `;

        const request = new sql.Request();
        request.input("Engineer", sql.VarChar, Engineer);
        request.input("CallNo", sql.VarChar, CallNo);
        request.input("Status", sql.VarChar, Status);
        request.input("CompanyGSTNumber", sql.VarChar, CompanyGSTNumber);
        request.input("CompanyName", sql.VarChar, CompanyName);
        request.input("Address", sql.VarChar, Address);
        request.input("CustomerComments", sql.VarChar, CustomerComments);
        request.input("CustomerMobileNumber", sql.VarChar, CustomerMobileNumber);
        request.input("CustomerName", sql.VarChar, CustomerName);
        request.input("CustomerType", sql.VarChar, CustomerType);
        request.input("IssueDescription", sql.VarChar, IssueDescription);
        request.input("LogDate", sql.DateTime, LogDate ? new Date(LogDate) : null);
        //request.input("mobileNumber", sql.VarChar, mobileNumber);
        request.input("ProductModel", sql.VarChar, ProductModel);
        request.input("ProductName", sql.VarChar, ProductName);
        request.input("ProductSerialNumber", sql.VarChar, ProductSerialNumber);
        request.input("CallType", sql.VarChar, CallType);

        await request.query(query);
        res.json({ message: "Ticket inserted successfully!" });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
});

// API to fetch filtered tickets
// Route to fetch filtered tickets
app.get("/tickets", async (req, res) => {
    const pool = await sql.connect(dbConfig);
  
    // Extract query parameters
    const {
      CallNo,
      LogDate,
      CustomerType,
      Status,
      CustomerMobileNumber,
      CustomerName,
      CallType,
      ProductName,
      ProductModel,
      ProductSerialNumber,
      Engineer,
    } = req.query;
  
    // Dynamic WHERE conditions
    let where = "WHERE 1=1"; // base
    if (CallNo) where += ` AND CallNo LIKE '%${CallNo}%'`;
    if (LogDate) where += ` AND LogDate = '${LogDate}'`;
    if (CustomerType) where += ` AND CustomerType LIKE '%${CustomerType}%'`;
    if (Status) where += ` AND Status LIKE '%${Status}%'`;
    if (CustomerMobileNumber) where += ` AND CustomerMobileNumber LIKE '%${CustomerMobileNumber}%'`;
    if (CustomerName) where += ` AND CustomerName LIKE '%${CustomerName}%'`;
    if (CallType) where += ` AND CallType LIKE '%${CallType}%'`;
    if (ProductName) where += ` AND ProductName LIKE '%${ProductName}%'`;
    if (ProductModel) where += ` AND ProductModel LIKE '%${ProductModel}%'`;
    if (ProductSerialNumber) where += ` AND ProductSerialNumber LIKE '%${ProductSerialNumber}%'`;
    if (Engineer) where += ` AND Engineer LIKE '%${Engineer}%'`;
  
    const result = await pool.request().query(`
      SELECT * FROM Ticket ${where}
    `);
  
    res.json(result.recordset);
  });
  
  //filter
  app.get('/tickets', async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const filters = req.query;
  
      const columnMap = {
        callNumber: "CallNo",
        logDate: "LogDate",
        customerType: "CustomerType",
        status: "Status",
        customerMobileNumber: "CustomerMobileNumber",
        customerName: "CustomerName",
        callType: "CallType",
        productName: "ProductName",
        productModel: "ProductModel",
        productSerialNumber: "ProductSerialNumber",
        engineer: "Engineer"
      };
  
      let query = "SELECT * FROM Ticket WHERE 1=1";
      const request = pool.request();
  
      for (const key in filters) {
        const column = columnMap[key];
        const value = filters[key];
  
        if (column && value) {
          query += ` AND ${column} LIKE @${key}`;
          request.input(key, sql.VarChar, `%${value}%`);
        }
      }
  
      const result = await request.query(query);
      res.json(result.recordset);
  
    } 
    
    
    catch (err) {
      console.error("SQL Error:", err);
      res.status(500).send("Server error");
    }
  });
  
  app.get("/engineers", async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("SELECT FirstName FROM Engineer");
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to fetch engineers");
    }

    
  });

  app.patch("/tickets/:sno/assign-engineer", async (req, res) => {
  const { sno } = req.params;
  const { Engineer } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    // 1. Update engineer name in Ticket table
    await pool.request()
      .input("Engineer", sql.VarChar, Engineer)
      .input("SNo", sql.Int, sno)
      .query(`UPDATE Ticket SET Engineer = @Engineer WHERE SNo = @SNo`);

    // 2. Get updated ticket details
    const ticketResult = await pool.request()
      .input("SNo", sql.Int, sno)
      .query("SELECT * FROM Ticket WHERE SNo = @SNo");
    const ticket = ticketResult.recordset[0];

    // 3. Get engineer details
    const engineerResult = await pool.request()
      .input("FirstName", sql.VarChar, Engineer)
      .query("SELECT * FROM Engineer WHERE FirstName = @FirstName");
    const engineer = engineerResult.recordset[0];

    if (!engineer || !engineer.Email) {
      return res.status(404).json({ error: "Engineer not found or missing email address" });
    }

    // 4. Format the message
    const subject = `New Ticket Assigned: ${ticket.CallNo}`;
    const htmlBody = `
      <h3>📟 New Ticket Assigned</h3>
      <p><b>Call No:</b> ${ticket.CallNo}</p>
      <p><b>Date:</b> ${ticket.LogDate}</p>
      <p><b>Call Type:</b> ${ticket.CallType}</p>
      <p><b>Customer Type:</b> ${ticket.CustomerType}</p>
      <p><b>Customer Name:</b> ${ticket.CustomerName}</p>
      <p><b>Customer Phone:</b> ${ticket.CustomerMobileNumber}</p>
      <p><b>Product:</b> ${ticket.ProductName} - ${ticket.ProductModel} - ${ticket.ProductSerialNumber}</p>
      <p><b>Address:</b> ${ticket.Address}</p>
      <p><b>Company:</b> ${ticket.CompanyName}</p>
      <p><b>Issue Description:</b> ${ticket.IssueDescription}</p>
      <p><b>Customeer Comments:</b> ${ticket.CustomerComments}</p>
      <p><b>Status:</b> ${ticket.Status || "Pending"}</p>
      <p>Please attend this service call.</p>
    `;

    // 5. Setup nodemailer transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'elavarasantechy@gmail.com',         // 🔐 Use your Gmail
        pass: 'ouwq rhon ifsm tkys'      // 🔐 Use an App Password, NOT your real password
      }
    });

    // 6. Send the email
    await transporter.sendMail({
      from: '"Service Desk" elavarasantechy@gmail.com',
      to: engineer.Email,
      subject,
      html: htmlBody
    });

    res.json({ success: true, message: "Engineer assigned and email sent via Gmail" });

  } catch (err) {
    console.error("Error in /assign-engineer:", err);
    res.status(500).json({ error: "Failed to assign engineer or send email" });
  }
});



//fetch customers
// API to fetch customers from ticket table
app.get("/api/customers", async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query(`
      SELECT 
        CustomerMobileNumber, CustomerType, CustomerName, CompanyName, 
        Address, CompanyGSTNumber 
      FROM Ticket
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Server error");
  }
});

//fetch mobile number
app.get('/customer-suggestions/:partialMobile', async (req, res) => {
  const { partialMobile } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('PartialMobile', sql.VarChar, `%${partialMobile}%`)
      .query(`
        SELECT TOP 10000 CustomerMobileNumber, CustomerName, Address, CompanyName, CompanyGSTNumber
        FROM Ticket
        WHERE CustomerMobileNumber LIKE @PartialMobile
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route: Update ticket status
app.patch('/tickets/:sno/update-status', async (req, res) => {
  const { sno } = req.params;
  const { Status } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('Status', sql.VarChar(255), Status)
      .input('SNo', sql.Int, sno)
      .query('UPDATE Ticket SET Status = @Status WHERE SNo = @SNo');

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PATCH update full ticket (backend server.js)
app.patch('/tickets/:sno', async (req, res) => {
  const { sno } = req.params;
  const updatedFields = req.body; // full object sent from frontend

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input('SNo', sql.Int, sno);

    // Dynamically build SET part of query
    const setStatements = [];
    for (const [key, value] of Object.entries(updatedFields)) {
      if (key !== 'SNo') { // don't update primary key
        request.input(key, sql.NVarChar(sql.MAX), value);
        setStatements.push(`${key} = @${key}`);
      }
    }

    const updateQuery = `
      UPDATE Ticket
      SET ${setStatements.join(', ')}
      WHERE SNo = @SNo
    `;

    await request.query(updateQuery);

    res.status(200).json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});
  
// Start Server on Port 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

