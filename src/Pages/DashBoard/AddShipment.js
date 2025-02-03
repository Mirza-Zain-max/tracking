import { Card, Col, Input, message, Row } from "antd";
import React, { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
// import RiderList from "./RiderList";

const AddShipment = () => {
  const [courirs, setCourirs] = useState(() => {
    const savedCouriers = localStorage.getItem("courirs");
    return savedCouriers ? JSON.parse(savedCouriers) : [];
  });
  const [form, setForm] = useState({ name: "", trackingId: "", status: "", amount: "" });

  useEffect(() => {
    const savedCouriers = localStorage.getItem('courirs');
    if (savedCouriers) {
      setCourirs(JSON.parse(savedCouriers));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddCourier = () => {
    if (form.name && form.trackingId && form.status && form.amount) {
        const timestamp = new Date().toISOString(); // Current date and time
        const updatedCouriers = [...courirs, { ...form, createdAt: timestamp }];
        setCourirs(updatedCouriers);
        localStorage.setItem("courirs", JSON.stringify(updatedCouriers));
        setForm({ name: "", trackingId: "", status: "", amount: "" });
        message.success("Courier added successfully!");
    } else {
        message.error("Please fill all fields!");
    }
};

  const handleKeyPress = (event, nextField) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      const nextInput = document.querySelector(`[name="${nextField}"]`);
      if (nextInput) {
        nextInput.focus(); // Move focus to the next input field
      } else if (nextField === "submit") {
        handleAddCourier(); // Submit form if last input
      }
    }
  };

  return (
    <main className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Container>
        <Row className="d-flex justify-content-center align-items-center">
          <Col xs={24} md={12} lg={10}>
            <div>
              <h1 className="my-5">Add Shipment</h1>
              <div className="form">
                <Card className="d-flex justify-content-center align-items-center">
                  <Input
                    className="my-2 border-2 rounded-2"
                    type="text"
                    name="name"
                    placeholder="Add Shipment Name"
                    value={form.name}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyPress(e, "trackingId")}
                  />
                  <Input
                    className="my-2 border-2 rounded-2"
                    type="number"
                    name="trackingId"
                    placeholder="Tracking ID"
                    value={form.trackingId}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyPress(e, "status")}
                  />
                  <Input
                    className="my-2 border-2 rounded-2"
                    type="text"
                    name="status"
                    placeholder="Courier Status"
                    value={form.status}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyPress(e, "amount")}
                  />
                  <Input
                    className="my-2 border-2 rounded-2"
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyPress(e, "submit")}
                  />
                  <div className="d-flex justify-content-center align-items-center">
                    <Button
                      className="btn btn-success justify-content-center w-50 align-items-center d-flex"
                      onClick={handleAddCourier}
                    >
                      Add Courier
                    </Button>
                  </div>
                </Card>
                      {/* <RiderList couriers={courirs} /> */}
                {/* Dropdown to display couriers */}
                {/* <div className="mt-4">
                  <h4>Available Couriers</h4>
                  <select className="form-select">
                    <option value="" disabled>
                      Select a Courier
                    </option>
                    {courirs.map((courir, index) => (
                      <option key={index} value={courir.name}>
                        {courir.name} - {courir.trackingId}
                      </option>
                    ))}
                  </select> 
                </div>*/}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default AddShipment;