// import { Table, Card, Select, DatePicker, Row, Col, Button, Input, message, Modal, Form } from "antd";
// import React, { useState, useEffect, useRef } from "react";
// import { Container } from "react-bootstrap";
// import { fireStore } from "../../Config/firebase"; // Adjust the import path as needed
// import { collection, getDocs, query, writeBatch, doc, deleteDoc, updateDoc, where } from "firebase/firestore";

// const { Option } = Select;

// const ShowData = () => {
//     const [data, setData] = useState([]);
//     const [riders, setRiders] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [selectedRider, setSelectedRider] = useState("All");
//     const [selectedDate, setSelectedDate] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const inputRefs = useRef([]);
//     const [newReceiver, setNewReceiver] = useState({});
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [editingRecord, setEditingRecord] = useState(null);
//     const [form] = Form.useForm();

//     useEffect(() => {
//         setLoading(true);

//         const fetchData = async () => {
//             try {
//                 const deliveriesQuery = query(collection(fireStore, "deliveries"));
//                 const deliveriesSnapshot = await getDocs(deliveriesQuery);
//                 const deliveries = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//                 console.log("Deliveries Loaded:", deliveries);
//                 setData(deliveries);
//                 setFilteredData(deliveries);

//                 const ridersQuery = query(collection(fireStore, "riders"));
//                 const ridersSnapshot = await getDocs(ridersQuery);
//                 const ridersList = ridersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//                 console.log("Riders Loaded:", ridersList);
//                 setRiders(ridersList);

//                 setLoading(false);
//             } catch (error) {
//                 console.error("Error fetching data: ", error);
//                 message.error("Failed to fetch data from Firestore!");
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     const filterData = (rider, date) => {
//         const filtered = data.filter((item) => {
//             const matchesRider = rider === "All" || item.riderId === rider;
//             const matchesDate = date ? item.date === date : true;
//             return matchesRider && matchesDate;
//         });
//         setFilteredData(filtered);
//     };

//     const handleRiderChange = (value) => {
//         setSelectedRider(value);
//         filterData(value, selectedDate);
//     };

//     const handleDateChange = (date, dateString) => {
//         setSelectedDate(dateString);
//         filterData(selectedRider, dateString);
//     };

//     const handleReciverChange = (e, cnNumber) => {
//         const { value } = e.target;
//         setNewReceiver((prev) => ({ ...prev, [cnNumber]: value }));
//     };

//     const handleKeyPress = (e, index) => {
//         if (e.key === "Enter" && inputRefs.current[index + 1]) {
//             inputRefs.current[index + 1].focus();
//         }
//     };

//     const handleSaveReciver = async () => {
//         try {
//             const batch = writeBatch(fireStore);
//             filteredData.forEach((item) => {
//                 if (newReceiver[item.cnNumber]) {
//                     const docRef = doc(fireStore, "deliveries", item.id);
//                     batch.update(docRef, { receiverName: newReceiver[item.cnNumber] });
//                 }
//             });
//             await batch.commit();
//             message.success("Receiver names saved successfully!");
//         } catch (error) {
//             console.error("Error saving receiver names: ", error);
//             message.error("Failed to save receiver names!");
//         }
//     };

//     const handleEdit = (record) => {
//         setEditingRecord(record);
//         form.setFieldsValue({
//             name: record.receiverName,
//             date: record.date,
//             consigneeName: record.consigneeName,
//         });
//         setIsModalVisible(true);
//     };

//     const handleDelete = async (record) => {
//         try {
//             const docRef = doc(fireStore, "deliveries", record.id);
//             await deleteDoc(docRef);
//             setFilteredData(filteredData.filter((item) => item.id !== record.id));
//             const updatedRiders = riders.filter((rider) => rider.id !== record.riderId);
//             setRiders(updatedRiders);
//             message.success("Record deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting record: ", error);
//             message.error("Failed to delete record!");
//         }
//     };

//     const handleModalOk = async () => {
//         try {
//             const values = await form.validateFields();
//             const docRef = doc(fireStore, "deliveries", editingRecord.id);
//             await updateDoc(docRef, {
//                 receiverName: values.name,
//                 date: values.date,
//                 consigneeName: values.consigneeName,
//             });
//             setFilteredData(filteredData.map((item) =>
//                 item.id === editingRecord.id ? { ...item, ...values } : item
//             ));
//             setIsModalVisible(false);
//             message.success("Record updated successfully!");
//         } catch (error) {
//             console.error("Error updating record: ", error);
//             message.error("Failed to update record!");
//         }
//     };

//     const handleModalCancel = () => {
//         setIsModalVisible(false);
//     };

//     const handleRiderDelete = async (riderId) => {
//         try {
//             const batch = writeBatch(fireStore);

//             // Delete the rider
//             const riderDocRef = doc(fireStore, "riders", riderId);
//             batch.delete(riderDocRef);

//             // Delete all deliveries associated with the rider
//             const deliveriesQuery = query(collection(fireStore, "deliveries"), where("riderId", "==", riderId));
//             const deliveriesSnapshot = await getDocs(deliveriesQuery);
//             deliveriesSnapshot.forEach((doc) => {
//                 batch.delete(doc.ref);
//             });

//             await batch.commit();

//             // Update state
//             setRiders(riders.filter((rider) => rider.id !== riderId));
//             setFilteredData(filteredData.filter((item) => item.riderId !== riderId));
//             setData(data.filter((item) => item.riderId !== riderId));

//             message.success("Rider and associated deliveries deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting rider and deliveries: ", error);
//             message.error("Failed to delete rider and deliveries!");
//         }
//     };

//     return (
//         <main className="d-flex justify-content-center align-items-center">
//             <Container className="m">
//                 <Row>
//                     <Col span={24}>
//                         <h1>Show Data</h1>
//                         <Card>
//                             <Select
//                                 name="riderName"
//                                 className="my-2 w-100"
//                                 value={selectedRider}
//                                 onChange={handleRiderChange}
//                                 dropdownRender={menu => (
//                                     <>
//                                         {menu}
//                                         <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8 }}>
//                                             <Button type="link" onClick={() => handleRiderDelete(selectedRider)} danger>
//                                                 Delete Selected Rider
//                                             </Button>
//                                         </div>
//                                     </>
//                                 )}
//                             >
//                                 <Option value="All">All Riders</Option>
//                                 {riders.map((rider) => (
//                                     <Option key={rider.id} value={rider.id}>
//                                         {rider.name}
//                                     </Option>
//                                 ))}
//                             </Select>
//                             <DatePicker
//                                 onChange={handleDateChange}
//                                 className="w-50"
//                             />
//                             <Button
//                                 type="primary"
//                                 className="mb-3"
//                                 onClick={handleSaveReciver}
//                             >
//                                 Save Receiver Names
//                             </Button>
//                             <Table
//                                 loading={loading}
//                                 dataSource={filteredData}
//                                 rowKey={(record) => record.id} // Ensure unique rowKey
//                                 pagination={false}
//                                 columns={[
//                                     {
//                                         title: "Rider Name",
//                                         key: "riderName",
//                                         render: (record) => {
//                                             const rider = riders.find(
//                                                 (r) => r.id === record.riderId
//                                             );
//                                             return rider?.name || "Unknown";
//                                         },
//                                     },
//                                     {
//                                         title: "CN Number",
//                                         dataIndex: "cnNumber",
//                                         key: "cnNumber",
//                                     },
//                                     {
//                                         title: "Consignee Name",
//                                         dataIndex: "consigneeName",
//                                         key: "consigneeName",
//                                     },
//                                     {
//                                         title: "Receiver Name",
//                                         key: "receiverName",
//                                         render: (record, _, index) => (
//                                             <Input
//                                                 defaultValue={record.receiverName}
//                                                 ref={(ref) =>
//                                                     (inputRefs.current[index] = ref)
//                                                 }
//                                                 onChange={(e) =>
//                                                     handleReciverChange(e, record.cnNumber)
//                                                 }
//                                                 onKeyDown={(e) => handleKeyPress(e, index)}
//                                             />
//                                         ),
//                                     },
//                                     {
//                                         title: "Date",
//                                         dataIndex: "date",
//                                         key: "date",
//                                     },
//                                     {
//                                         title: "Actions",
//                                         key: "actions",
//                                         render: (record) => (
//                                             <div>
//                                                 <Button
//                                                     type="link"
//                                                     onClick={() => handleEdit(record)}
//                                                 >
//                                                     Edit
//                                                 </Button>
//                                                 <Button
//                                                     type="link"
//                                                     danger
//                                                     onClick={() => handleDelete(record)}
//                                                 >
//                                                     Delete
//                                                 </Button>
//                                             </div>
//                                         ),
//                                     },
//                                 ]}
//                             />
//                         </Card>
//                     </Col>
//                 </Row>
//             </Container>
//             <Modal
//                 title="Edit Record"
//                 visible={isModalVisible}
//                 onOk={handleModalOk}
//                 onCancel={handleModalCancel}
//             >
//                 <Form form={form} layout="vertical">
//                     <Form.Item
//                         name="name"
//                         label="Receiver Name"
//                         rules={[{ required: true, message: 'Please input the receiver name!' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                     <Form.Item
//                         name="date"
//                         label="Date"
//                         rules={[{ required: true, message: 'Please input the date!' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                     <Form.Item
//                         name="consigneeName"
//                         label="Consignee Name"
//                         rules={[{ required: true, message: 'Please input the consignee name!' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </main>
//     );
// };

// export default ShowData;

import { Table, Card, Select, DatePicker, Row, Col, Button, Input, message, Modal, Form } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import { fireStore } from "../../Config/firebase"; // Adjust the import path as needed
import { collection, getDocs, query, writeBatch, doc, deleteDoc, updateDoc, where } from "firebase/firestore";
import { useAuthContext } from "../../Context/Auth";
import { DeleteFilled, EditFilled } from "@ant-design/icons";

const { Option } = Select;

const ShowData = () => {
    const { user } = useAuthContext();
    const [data, setData] = useState([]);
    const [riders, setRiders] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedRider, setSelectedRider] = useState("All");
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const inputRefs = useRef([]);
    const [newReceiver, setNewReceiver] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        setLoading(true);

        const fetchData = async () => {
            try {
                const deliveriesQuery = query(collection(fireStore, "deliveries"));
                const deliveriesSnapshot = await getDocs(deliveriesQuery);
                const deliveries = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Deliveries Loaded:", deliveries);
                setData(deliveries);
                setFilteredData(deliveries);
                const ridersQuery = query(collection(fireStore, "riders"));
                const ridersSnapshot = await getDocs(ridersQuery);
                const ridersList = ridersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Riders Loaded:", ridersList);
                setRiders(ridersList);
                setLoading(false);
            } catch (error) {
                message.error("Failed to fetch data from Firestore!");
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const filterData = (rider, date) => {
        const filtered = data.filter((item) => {
            const matchesRider = rider === "All" || item.riderId === rider;
            const matchesDate = date ? item.date === date : true;
            return matchesRider && matchesDate;
        });
        setFilteredData(filtered);
    };
    const handleRiderChange = (value) => { setSelectedRider(value); filterData(value, selectedDate) };
    const handleDateChange = (date, dateString) => { setSelectedDate(dateString); filterData(selectedRider, dateString) };
    const handleReciverChange = (e, cnNumber) => { const { value } = e.target; setNewReceiver((prev) => ({ ...prev, [cnNumber]: value })) };
    const handleKeyPress = (e, index) => { if (e.key === "Enter" && inputRefs.current[index + 1]) { inputRefs.current[index + 1].focus() } };
    const handleSaveReciver = async () => {
        try {
            const batch = writeBatch(fireStore);
            filteredData.forEach((item) => {
                if (newReceiver[item.cnNumber]) {
                    const docRef = doc(fireStore, "deliveries", item.id);
                    batch.update(docRef, { receiverName: newReceiver[item.cnNumber] });
                }
            });
            await batch.commit();
            message.success("Receiver names saved successfully!");
        } catch (error) {
            console.error("Error saving receiver names: ", error);
            message.error("Failed to save receiver names!");
        }
    };
    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            name: record.receiverName,
            date: record.date,
            consigneeName: record.consigneeName,
        });
        setIsModalVisible(true);
    };
    const handleDelete = async (record) => {
        try {
            const docRef = doc(fireStore, "deliveries", record.id);
            await deleteDoc(docRef);
            setFilteredData(filteredData.filter((item) => item.id !== record.id));
            const updatedRiders = riders.filter((rider) => rider.id !== record.riderId);
            setRiders(updatedRiders);
            message.success("Record deleted successfully!");
        } catch (error) {
            console.error("Error deleting record: ", error);
            message.error("Failed to delete record!");
        }
    };
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const docRef = doc(fireStore, "deliveries", editingRecord.id);
            await updateDoc(docRef, {
                receiverName: values.name,
                date: values.date,
                consigneeName: values.consigneeName,
            });
            setFilteredData(filteredData.map((item) =>
                item.id === editingRecord.id ? { ...item, ...values } : item
            ));
            setIsModalVisible(false);
            message.success("Record updated successfully!");
        } catch (error) {
            console.error("Error updating record: ", error);
            message.error("Failed to update record!");
        }
    };

    const handleModalCancel = () => { setIsModalVisible(false) };
    const handleRiderDelete = async (riderId) => {
        try {
            const batch = writeBatch(fireStore);

            // Delete the rider
            const riderDocRef = doc(fireStore, "riders", riderId);
            batch.delete(riderDocRef);

            // Delete all deliveries associated with the rider
            const deliveriesQuery = query(collection(fireStore, "deliveries"), where("riderId", "==", user.Id));
            const deliveriesSnapshot = await getDocs(deliveriesQuery);
            deliveriesSnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            // Update state
            setRiders(riders.filter((rider) => rider.id !== riderId));
            setFilteredData(filteredData.filter((item) => item.riderId !== riderId));
            setData(data.filter((item) => item.riderId !== riderId));

            message.success("Rider and associated deliveries deleted successfully!");
        } catch (error) {
            console.error("Error deleting rider and deliveries: ", error);
            message.error("Failed to delete rider and deliveries!");
        }
    };

    return (
        <main className="d-flex justify-content-center align-items-center">
            <Container className="m">
                <Row>
                    <Col span={24}>
                        <h1>Show Data</h1>
                        <Card>
                            <Select name="riderName" className="my-2 w-100" value={selectedRider} onChange={handleRiderChange}
                                dropdownRender={menu => (
                                    <>
                                        {menu}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8 }}>
                                            <Button type="link" onClick={() => handleRiderDelete(selectedRider)} danger>
                                                Delete Selected Rider
                                            </Button>
                                        </div>
                                    </>
                                )}
                            >
                                <Option value="All">All Riders</Option>
                                {riders.map((rider) => (
                                    <Option key={rider.id} value={rider.id}>
                                        {rider.name}
                                    </Option>
                                ))}
                            </Select>
                            <DatePicker onChange={handleDateChange} className="w-50" />
                            <Button type="primary" className="mb-3" onClick={handleSaveReciver}                            >
                                Save Receiver Names
                            </Button>
                            <Table loading={loading} dataSource={filteredData} rowKey={(record) => record.id} pagination={false}
                                columns={[{
                                    title: "Rider Name",
                                    key: "riderName", theme: 'grid',
                                    render: (record) => {
                                        const rider = riders.find(
                                            (r) => r.id === record.riderId
                                        );
                                        return rider?.name || "Unknown";
                                    },
                                },
                                {
                                    title: "CN Number",
                                    dataIndex: "cnNumber",
                                    key: "cnNumber",
                                },
                                {
                                    title: "Consignee Name",
                                    dataIndex: "consigneeName",
                                    key: "consigneeName",
                                },
                                {
                                    title: "Receiver Name",
                                    key: "receiverName",
                                    render: (record, _, index) => (
                                        <Input className="border-0" defaultValue={record.receiverName}
                                            ref={(ref) =>
                                                (inputRefs.current[index] = ref)
                                            }
                                            onChange={(e) =>
                                                handleReciverChange(e, record.cnNumber)
                                            }
                                            onKeyDown={(e) => handleKeyPress(e, index)}
                                        />
                                    ),
                                },
                                {
                                    title: "Date",
                                    dataIndex: "date",
                                    key: "date",
                                },
                                {
                                    title: "Actions",
                                    key: "actions",
                                    render: (record) => (
                                        <div>
                                            <Button onClick={() => handleEdit(record)}>
                                                <EditFilled />
                                            </Button>
                                            <Button danger onClick={() => handleDelete(record)}>
                                                <DeleteFilled />
                                            </Button>
                                        </div>
                                    ),
                                },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Modal title="Edit Record" visible={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Receiver Name" rules={[{ required: true, message: 'Please input the receiver name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please input the date!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="consigneeName" label="Consignee Name" rules={[{ required: true, message: 'Please input the consignee name!' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </main>
    );
};

export default ShowData;



// import { Table, Card, Select, DatePicker, Row, Col, Button, Input, message, Modal, Form } from "antd";
// import React, { useState, useEffect, useRef } from "react";
// import { Container } from "react-bootstrap";
// import { fireStore } from "../../Config/firebase"; // Adjust the import path as needed
// import { collection, getDocs, query, writeBatch, doc, deleteDoc, updateDoc, where } from "firebase/firestore";
// import { useAuthContext } from "../../Context/Auth";

// const { Option } = Select;

// const ShowData = () => {
//      const { user} = useAuthContext();
//     const [data, setData] = useState([]);
//     const [riders, setRiders] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [selectedRider, setSelectedRider] = useState("All");
//     const [selectedDate, setSelectedDate] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const inputRefs = useRef([]);
//     const [newReceiver, setNewReceiver] = useState({});
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [editingRecord, setEditingRecord] = useState(null);
//     const [form] = Form.useForm();

//     useEffect(() => {
//         setLoading(true);

//         const fetchData = async () => {
//             try {
//                 const deliveriesQuery = query(collection(fireStore, "deliveries"));
//                 const deliveriesSnapshot = await getDocs(deliveriesQuery);
//                 const deliveries = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//                 console.log("Deliveries Loaded:", deliveries);
//                 setData(deliveries);
//                 setFilteredData(deliveries);

//                 const ridersQuery = query(collection(fireStore, "riders") );
//                 const ridersSnapshot = await getDocs(ridersQuery);
//                 const ridersList = ridersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//                 console.log("Riders Loaded:", ridersList);
//                 setRiders(ridersList);

//                 setLoading(false);
//             } catch (error) {
//                 console.error("Error fetching data: ", error);
//                 message.error("Failed to fetch data from Firestore!");
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     const filterData = (rider, date) => {
//         const filtered = data.filter((item) => {
//             const matchesRider = rider === "All" || item.riderId === rider;
//             const matchesDate = date ? item.date === date : true;
//             return matchesRider && matchesDate;
//         });
//         setFilteredData(filtered);
//     };

//     const handleRiderChange = (value) => {
//         setSelectedRider(value);
//         filterData(value, selectedDate);
//     };

//     const handleDateChange = (date, dateString) => {
//         setSelectedDate(dateString);
//         filterData(selectedRider, dateString);
//     };

//     const handleReciverChange = (e, cnNumber) => {
//         const { value } = e.target;
//         setNewReceiver((prev) => ({ ...prev, [cnNumber]: value }));
//     };

//     const handleKeyPress = (e, index) => {
//         if (e.key === "Enter" && inputRefs.current[index + 1]) {
//             inputRefs.current[index + 1].focus();
//         }
//     };

//     const handleSaveReciver = async () => {
//         try {
//             const batch = writeBatch(fireStore);
//             filteredData.forEach((item) => {
//                 if (newReceiver[item.cnNumber]) {
//                     const docRef = doc(fireStore, "deliveries", item.id);
//                     batch.update(docRef, { receiverName: newReceiver[item.cnNumber] });
//                 }
//             });
//             await batch.commit();
//             message.success("Receiver names saved successfully!");
//         } catch (error) {
//             console.error("Error saving receiver names: ", error);
//             message.error("Failed to save receiver names!");
//         }
//     };

//     const handleEdit = (record) => {
//         setEditingRecord(record);
//         form.setFieldsValue({
//             name: record.receiverName,
//             date: record.date,
//             consigneeName: record.consigneeName,
//         });
//         setIsModalVisible(true);
//     };

//     const handleDelete = async (record) => {
//         try {
//             const docRef = doc(fireStore, "deliveries", record.id);
//             await deleteDoc(docRef);
//             setFilteredData(filteredData.filter((item) => item.id !== record.id));
//             const updatedRiders = riders.filter((rider) => rider.id !== record.riderId);
//             setRiders(updatedRiders);
//             message.success("Record deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting record: ", error);
//             message.error("Failed to delete record!");
//         }
//     };

//     const handleModalOk = async () => {
//         try {
//             const values = await form.validateFields();
//             const docRef = doc(fireStore, "deliveries", editingRecord.id);
//             await updateDoc(docRef, {
//                 receiverName: values.name,
//                 date: values.date,
//                 consigneeName: values.consigneeName,
//             });
//             setFilteredData(filteredData.map((item) =>
//                 item.id === editingRecord.id ? { ...item, ...values } : item
//             ));
//             setIsModalVisible(false);
//             message.success("Record updated successfully!");
//         } catch (error) {
//             console.error("Error updating record: ", error);
//             message.error("Failed to update record!");
//         }
//     };

//     const handleModalCancel = () => {
//         setIsModalVisible(false);
//     };

//     const handleRiderDelete = async (riderId) => {
//         try {
//             const batch = writeBatch(fireStore);

//             // Delete the rider
//             const riderDocRef = doc(fireStore, "riders", riderId);
//             batch.delete(riderDocRef);

//             // Delete all deliveries associated with the rider
//             const deliveriesQuery = query(collection(fireStore, "deliveries"), where("riderId", "==", user.Id));
//             const deliveriesSnapshot = await getDocs(deliveriesQuery);
//             deliveriesSnapshot.forEach((doc) => {
//                 batch.delete(doc.ref);
//             });

//             await batch.commit();

//             // Update state
//             setRiders(riders.filter((rider) => rider.id !== riderId));
//             setFilteredData(filteredData.filter((item) => item.riderId !== riderId));
//             setData(data.filter((item) => item.riderId !== riderId));

//             message.success("Rider and associated deliveries deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting rider and deliveries: ", error);
//             message.error("Failed to delete rider and deliveries!");
//         }
//     };

//     return (
//         <main className="d-flex justify-content-center align-items-center">
//             <Container className="m">
//                 <Row>
//                     <Col span={24}>
//                         <h1>Show Data</h1>
//                         <Card>
//                             <Select
//                                 name="riderName"
//                                 className="my-2 w-100"
//                                 value={selectedRider}
//                                 onChange={handleRiderChange}
//                                 dropdownRender={menu => (
//                                     <>
//                                         {menu}
//                                         <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8 }}>
//                                             <Button type="link" onClick={() => handleRiderDelete(selectedRider)} danger>
//                                                 Delete Selected Rider
//                                             </Button>
//                                         </div>
//                                     </>
//                                 )}
//                             >
//                                 <Option value="All">All Riders</Option>
//                                 {riders.map((rider) => (
//                                     <Option key={rider.id} value={rider.id}>
//                                         {rider.name}
//                                     </Option>
//                                 ))}
//                             </Select>
//                             <DatePicker
//                                 onChange={handleDateChange}
//                                 className="w-50"
//                             />
//                             <Button
//                                 type="primary"
//                                 className="mb-3"
//                                 onClick={handleSaveReciver}
//                             >
//                                 Save Receiver Names
//                             </Button>
//                             <Table
//                                 loading={loading}
//                                 dataSource={filteredData}
//                                 rowKey={(record) => record.id} // Ensure unique rowKey
//                                 pagination={false}
//                                 columns={[
//                                     {
//                                         title: "Rider Name",
//                                         key: "riderName",
//                                         render: (record) => {
//                                             const rider = riders.find(
//                                                 (r) => r.id === record.riderId
//                                             );
//                                             return rider?.name || "Unknown";
//                                         },
//                                     },
//                                     {
//                                         title: "CN Number",
//                                         dataIndex: "cnNumber",
//                                         key: "cnNumber",
//                                     },
//                                     {
//                                         title: "Consignee Name",
//                                         dataIndex: "consigneeName",
//                                         key: "consigneeName",
//                                     },
//                                     {
//                                         title: "Receiver Name",
//                                         key: "receiverName",
//                                         render: (record, _, index) => (
//                                             <Input
//                                                 defaultValue={record.receiverName}
//                                                 ref={(ref) =>
//                                                     (inputRefs.current[index] = ref)
//                                                 }
//                                                 onChange={(e) =>
//                                                     handleReciverChange(e, record.cnNumber)
//                                                 }
//                                                 onKeyDown={(e) => handleKeyPress(e, index)}
//                                             />
//                                         ),
//                                     },
//                                     {
//                                         title: "Date",
//                                         dataIndex: "date",
//                                         key: "date",
//                                     },
//                                     {
//                                         title: "Actions",
//                                         key: "actions",
//                                         render: (record) => (
//                                             <div>
//                                                 <Button
//                                                     type="link"
//                                                     onClick={() => handleEdit(record)}
//                                                 >
//                                                     Edit
//                                                 </Button>
//                                                 <Button
//                                                     type="link"
//                                                     danger
//                                                     onClick={() => handleDelete(record)}
//                                                 >
//                                                     Delete
//                                                 </Button>
//                                             </div>
//                                         ),
//                                     },
//                                 ]}
//                             />
//                         </Card>
//                     </Col>
//                 </Row>
//             </Container>
//             <Modal
//                 title="Edit Record"
//                 visible={isModalVisible}
//                 onOk={handleModalOk}
//                 onCancel={handleModalCancel}
//             >
//                 <Form form={form} layout="vertical">
//                     <Form.Item
//                         name="name"
//                         label="Receiver Name"
//                         rules={[{ required: true, message: 'Please input the receiver name!' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                     <Form.Item
//                         name="date"
//                         label="Date"
//                         rules={[{ required: true, message: 'Please input the date!' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                     <Form.Item
//                         name="consigneeName"
//                         label="Consignee Name"
//                         rules={[{ required: true, message: 'Please input the consignee name!' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </main>
//     );
// };

// export default ShowData; 