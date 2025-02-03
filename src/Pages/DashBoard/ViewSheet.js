import { Card, Col, Input, Row, Select, Table, Typography, Button, message } from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { fireStore } from "../../Config/firebase"; // Adjust the import path as needed
import { collection, getDocs, query} from "firebase/firestore";

const { Option } = Select;
const { Title } = Typography;

const ViewSheet = () => {
  const [riders, setRiders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [deliverySheetData, setDeliverySheetData] = useState([]);
  const [delivery, setDelivery] = useState({ riderId: "", date: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ridersQuery = query(collection(fireStore, "riders"));
        const ridersSnapshot = await getDocs(ridersQuery);
        const ridersList = ridersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRiders(ridersList);
        const deliveriesQuery = query(collection(fireStore, "deliveries"));
        const deliveriesSnapshot = await getDocs(deliveriesQuery);
        const deliveriesList = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeliveries(deliveriesList);
      } catch (error) {
        message.error("Failed to fetch data from Firestore!");
      }
    };

    fetchData();
  }, []);

  const handleDeliveryChange = (name, value) => {
    setDelivery((prev) => ({ ...prev, [name]: value }));
  };

  const viewDeliverySheet = () => {
    if (!delivery.riderId || !delivery.date) {
      message.error("Please select both rider and date!");
      return;
    }
    const selectedRider = riders.find(rider => rider.id === delivery.riderId);
    const riderName = selectedRider ? selectedRider.name : "";
    const filteredDeliveries = deliveries
      .filter((d) => d.riderName === riderName && d.date === delivery.date)
      .map((d) => ({
        ...d,
        riderName,
      }));
    setDeliverySheetData(filteredDeliveries);
  };
  // const viewDeliverySheet = async () => {
  //   if (!delivery.riderId || !delivery.date) {
  //     message.error("Please select both rider and date!");
  //     return;
  //   }
  //   try {
  //     // Fetch selected rider's name based on riderId
  //     const selectedRider = riders.find(rider => rider.id === delivery.riderId);
  //     if (!selectedRider) {
  //       message.error("Invalid Rider Selected!");
  //       return;
  //     }

  //     const riderName = selectedRider.name; // Ensure this matches Firestore data exactly

  //     // Firestore Query: Fetch deliveries with matching rider and date
  //     const deliveriesQuery = query(
  //       collection(fireStore, "deliveries"),
  //       // where("riderName", "==", riderName),
  //       // where("date", "==", delivery.date)
  //     );

  //     const deliveriesSnapshot = await getDocs(deliveriesQuery);

  //     // Process the retrieved documents
  //     const filteredDeliveries = deliveriesSnapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     // Update state with filtered deliveries
  //     setDeliverySheetData(filteredDeliveries);
  //   } catch (error) {
  //     console.error("Error fetching filtered deliveries: ", error);
  //     message.error("Failed to fetch delivery sheet data!");
  //   }finally{
  //     message.error("Failed to fetch delivery sheet data!")
  //   }
  // };
  const downloadPDFSheet = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = "Delivery Sheet";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);
    if (deliverySheetData.length > 0) {
      const riderNameText = `Rider Name: ${deliverySheetData[0].riderName}`;
      const riderNameWidth = doc.getTextWidth(riderNameText);
      doc.text(riderNameText, (pageWidth - riderNameWidth) / 2, 30);
      const riderDateText = `Date: ${deliverySheetData[0].date}`;
      const riderDateWidth = doc.getTextWidth(riderDateText);
      doc.text(riderDateText, (pageWidth - riderDateWidth) / 2, 40);
    }
    const bodyData = [];
    for (let i = 0; i < deliverySheetData.length; i += 2) {
      const firstItem = deliverySheetData[i];
      const secondItem = deliverySheetData[i + 1] || {};
      bodyData.push([
        i + 1,
        `${firstItem.cnNumber}\n${firstItem.consigneeName}`,
        '',
        '',
        i + 2,
        `${secondItem.cnNumber || ''}\n${secondItem.consigneeName || ''}`,
        '',
        firstItem.date,
      ]);
    }
    while (bodyData.length < 10) {
      bodyData.push([
        bodyData.length * 2 + 1,
        '',
        '',
        '',
        bodyData.length * 2 + 2,
        '',
        '',
        '',
      ]);
    }
    doc.autoTable({
      head: [["Index", "CN Number / Consignee Name ", "Receiver Name / Signature /Stamp", "", "Index", "CN Number / Consignee Name", "Receiver Name / Signature /Stamp"]],
      body: bodyData,
      startY: 50,
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        minCellHeight: 20, // Row height to fill A4 page
        fontSize: 12,
      },
      pageBreak: 'auto',
      tableWidth: 'auto',
      margin: { top: 30, bottom: 30 },
    });
    const fileName = `${deliverySheetData[0]?.date}_${deliverySheetData[0]?.riderName}.pdf`;
    doc.save(fileName);
  };
  const columns = [
    { title: "Index", dataIndex: "index", key: "index" },
    { title: "CN Number", dataIndex: "cnNumber", key: "cnNumber" },
    { title: "Consignee Name", dataIndex: "consigneeName", key: "consigneeName" },
    { title: "Receiver Name", dataIndex: "receiverName", key: "receiverName" },
    { title: "Date", dataIndex: "date", key: "date" },
  ];
  const indexedDeliverySheetData = deliverySheetData.map((item, index) => ({
    ...item,
    index: index + 1,
  }));

  return (
    <main className="d-flex justify-content-center align-items-center" >
      <Container>
        <Row className="d-flex justify-content-center align-items-center">
          <Col span={24}>
            <Card className="mt-5">
              <Title level={1}>View Delivery Sheet</Title>
              <label>Select Rider:</label>
              <Select name="riderId" value={delivery.riderId} onChange={(value) => handleDeliveryChange("riderId", value)} style={{ width: "100%", marginBottom: "1rem" }} placeholder="Select a rider">
                {riders.map((rider) => (<Option key={rider.id} value={rider.id}>
                  {rider.name}
                </Option>
                ))}
              </Select>
              <label>Select Date:</label>
              <Input type="date" name="date" value={delivery.date} onChange={(e) => handleDeliveryChange("date", e.target.value)} style={{ width: "100%", marginBottom: "1rem" }} />
              <Button type="primary" onClick={viewDeliverySheet} style={{ marginBottom: "1rem" }}>
                View Delivery Sheet
              </Button>
              {deliverySheetData.length > 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <hr />
                  <h2 className="text-center">{deliverySheetData[0]?.riderName}</h2>
                  <Table bordered id="deliverySheet" columns={columns} dataSource={indexedDeliverySheetData} rowKey="id" pagination={false} className="text-center border-2 h-auto" />
                  <Button className="bg-success text-light" onClick={downloadPDFSheet} style={{ marginTop: "1rem" }}>
                    Download as PDF
                  </Button>
                </div>
              ) : (
                <p>No deliveries found for the selected rider and date.</p>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ViewSheet;