// components/PopupModal.js
import React, { useState, useEffect } from "react";
import "./PopupModel.css";

const PopupModel = ({ isOpen, onClose, data, onUpdate }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:3000/tickets/${formData.SNo}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send full form data
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }

      console.log('Ticket updated successfully');
      onUpdate(formData); // update in frontend memory
      onClose(); // close modal
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Edit Ticket</h2>
        <div className="modal-content">
          {Object.keys(formData)
            .filter((key) => key !== 'SNo' && key !== 'Engineer' && key !== 'Status')
            .map((key) => (
              <div key={key} className="input-row">
                <label>{key}</label>
                <input
                  type={key === 'logDate' ? 'date' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  disabled={key === 'LogDate' || key === 'CallNo'}
                />
              </div>
            ))}
        </div>
        <div className="modal-buttons">
          <button onClick={handleSubmit}>Update</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PopupModel;
