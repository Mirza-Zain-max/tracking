import { Button, Card, Col, Input, message, Row, Typography } from "antd";
import React, { useState, useEffect } from "react";
import { Container, Table } from "react-bootstrap";
import { fireStore } from "../../Config/firebase"; // Adjust the import path as needed
import { addDoc, collection, getDocs, query } from "firebase/firestore";

const TrackShipment = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [riders, setRiders] = useState([]);
    const { Title } = Typography;
    const [trackCN, setTrackCN] = useState('');
    const [trackResult, setTrackResult] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const deliveriesQuery = query(collection(fireStore, "deliveries"));
                const deliveriesSnapshot = await getDocs(deliveriesQuery);
                const deliveriesList = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDeliveries(deliveriesList);
                const ridersQuery = query(collection(fireStore, "riders"));
                const ridersSnapshot = await getDocs(ridersQuery);
                const ridersList = ridersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRiders(ridersList);
            } catch (error) {
                message.error("Failed to fetch data from Firestore!");
            }
        };
        fetchData();
    }, []);

    // const handleTrackCNChange = (e) => { setTrackCN(e.target.value) };
    // const trackShipment = () => {
    //     if (!trackCN.trim()) {
    //         message.warning("Please enter a CN Number.");
    //         return;
    //     }
    //     const result = deliveries.find(delivery => delivery.cnNumber === trackCN.trim());
    //     if (result) {
    //         const rider = riders.find(r => r.id === result.riderId);
    //         setTrackResult({ ...result, riderName: rider ? rider.name : "Unknown" });
    //         message.success("Delivery found successfully!");
    //     } else {
    //         setTrackResult(null);
    //         message.error("No delivery found with this CN Number.");
    //     }
    // };

    const handleTrackCNChange = (e) => {
        setTrackCN(e.target.value);
    };

    const trackShipment = () => {
        if (!trackCN.trim()) {
            message.warning("Please enter a CN Number.");
            return;
        }

        // Find all deliveries with matching CN Number
        const results = deliveries.filter(delivery => delivery.cnNumber === trackCN.trim());

        if (results.length > 0) {
            // Map through results to include rider names
            const trackedDeliveries = results.map(result => {
                const rider = riders.find(r => r.id === result.riderId);
                return { ...result, riderName: rider ? rider.name : "Unknown" };
            });

            setTrackResult(trackedDeliveries);
            message.success(`${results.length} deliveries found with this CN Number!`);
        } else {
            setTrackResult(null);
            message.error("No delivery found with this CN Number.");
        }
    };

    const handleKeyPress = (event) => { if (event.key === "Enter") { trackShipment() } };

    const saveTrackingData = async () => {
        if (!trackResult) {
            message.error("No tracking data to save.");
            return;
        }
        try {
            await addDoc(collection(fireStore, "tracking"), trackResult);
            message.success("Tracking data saved successfully!");
        } catch (error) {
            message.error("Failed to save tracking data!");
        }
    };

    return (
        <main className="d-flex justify-content-center align-items-center" >
            <Container>
                <Row className="d-flex justify-content-center align-items-center" >
                    <Col span={24}>
                        <Card className="mt-5">
                            <Title level={1}>Track Shipment</Title>
                            <label className="fw-bolder mb-4">Enter CN Number:</label>
                            <Input className="mb-4" type="text" value={trackCN} onChange={handleTrackCNChange} onKeyDown={handleKeyPress} placeholder="Enter CN Number" />
                            <Button className="w-25 p-3 " type="primary" onClick={trackShipment}                            >
                                Track
                            </Button>
                            {trackResult ? (
                                <div>
                                    <hr />
                                    <h3 className="text-center">Tracking Shipment</h3>
                                    {/* <Table border="3" bordered style={{ marginTop: '20px', width: '100%', textAlign: 'left' }} rowKey={(record) => record.id}>
                                        <thead>
                                            <tr>
                                                <th>Rider</th>
                                                <th>Date</th>
                                                <th>Consignee Name</th>
                                                <th>Receiver Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{trackResult.riderName}</td>
                                                <td>{trackResult.date}</td>
                                                <td>{trackResult.consigneeName}</td>
                                                <td>{trackResult.receiverName}</td>
                                            </tr>
                                        </tbody>
                                    </Table> */}
                                    {trackResult && trackResult.length > 0 && (
                                        <Table border="1">
                                            <thead>
                                                <tr>
                                                    <th>CN Number</th>
                                                    <th>Consignee Name</th>
                                                    <th>Rider Name</th>
                                                    <th>Receiver Name</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trackResult.map((delivery, index) => (
                                                    <tr key={index}>
                                                        <td>{delivery.cnNumber}</td>
                                                        <td>{delivery.consigneeName}</td>
                                                        <td>{delivery.riderName}</td>
                                                        <td>{delivery.receiverName}</td>
                                                        <td>{delivery.date}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}

                                </div>
                            ) : trackCN && (
                                <p style={{ color: 'red', marginTop: '20px' }}>
                                    No delivery found with this CN Number.
                                </p>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </main>
    );
};

export default TrackShipment;