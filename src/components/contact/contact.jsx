import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from "axios";
import './contact.scss';

function Contact() {
    const [edit, setEdit] = useState(false);
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [data, setData] = useState([]);
    const [currentRecord, setCurrentRecord] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [emailIsValid, setEmailIsValid] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);

    const handleShow = () => {
        setEdit(false);
        setShow(true);
    };

    const handleSave = () => {
        if (isValid) {
            if (edit === true) {
                axios.put(`http://localhost:8082/api/contact/${currentRecord.id}`, {
                    name: name,
                    email: email,
                    address: address,
                    phoneNumbers: phoneNumbers,
                })
                    .then(response => {
                        console.log(response);
                        const updatedData = data.map(item => item.id === currentRecord.id ? { id: currentRecord.id, name, email, address, phoneNumbers } : item);
                        setData(updatedData);
                        setUpdateModal(true);
                    })
                    .catch(error => {
                        console.error("Hubo un error al actualizar el registro: ", error);
                    });
                setEdit(false);
            } else {
                axios.post('http://localhost:8082/api/contact', {
                    name: name,
                    email: email,
                    address: address,
                    phoneNumbers: phoneNumbers,
                })
                    .then((response) => {
                        const newContact = {
                            id: data.length + 1,
                            name: name,
                            email: email,
                            address: address,
                            phoneNumbers: phoneNumbers,
                        };
                        setData(prevData => [...prevData, newContact]);
                        setShow(false);
                        setCreateModal(true);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
            setShow(false);
            setEdit(false);
            setName('');
            setEmail('');
            setAddress('');
        }
    };

    const handleNameChange = (e) => {
        const newValue = e.target.value;
        if (!/\d/.test(newValue)) {
            setName(newValue);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios('http://localhost:8082/api/contact');
            setData(result.data);
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            const isValidName = name && name.trim() !== '';
            const isValidEmail = email && emailRegex.test(email);
            const isValidAddress = address && address.trim() !== '';
            setEmailIsValid(isValidEmail);
            setIsValid(isValidName && isValidEmail && isValidAddress);
        };
        fetchData();
    }, [name, email, address]);

    const handleDeleteConfirm = (record) => {
        setCurrentRecord(record);
        setDeleteModal(true);
    };

    const handleDelete = (record) => {
        axios.delete(`http://localhost:8082/api/contact/${record.id}`)
            .then(response => {
                console.log(response);
                const updatedData = data.filter(item => item.id !== record.id);
                setData(updatedData);
            })
            .catch(error => {
                console.error("Hubo un error al eliminar el registro: ", error);
            });
        setDeleteModal(false);
    };

    const handleEdit = (item) => {
        setCurrentRecord(item)
        setName(item.name);
        setEmail(item.email);
        setAddress(item.address);
        setEdit(true);
        setShow(true);

    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <h1 className="text-center mt-5" style={{ fontSize: '3em' }}>¡Bienvenidos a nuestros contactos!</h1>
                    <p className="text-center mt-4">
                        Aquí puedes ver todos nuestros contactos y sus detalles.
                    </p>
                </Col>
            </Row>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Dirección</th>
                        <th>Teléfonos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.address}</td>
                            <td>
                                {item.phoneNumbers.map(phone => (
                                    <div key={phone.id}>{phone.number} ({phone.description})</div>
                                ))}
                            </td>
                            <td>
                                <Button variant="primary" style={{ marginRight: '10px' }} onClick={() => handleEdit(item)}>Editar</Button>
                                <Button variant="danger" onClick={() => handleDeleteConfirm(item)}>Eliminar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div className="d-flex align-items-center justify-content-center">
                <Button variant="primary" onClick={handleShow}>
                    Crear contacto
                </Button>
            </div>
            <Modal show={show} onHide={() => {
                setShow(false);
                setEdit(false);
                setName('');
                setEmail('');
                setAddress('');
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>Contacto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" placeholder="Ingrese Nombre" value={name} onChange={handleNameChange} />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="Ingrese Email" value={email} onChange={e => setEmail(e.target.value)} className={!emailIsValid ? 'invalid' : ''} />
                        </Form.Group>
                        <Form.Group controlId="formAddress">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control type="text" placeholder="Ingrese Dirección" value={address} onChange={e => setAddress(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShow(false);
                        setEdit(false);
                        setName('');
                        setEmail('');
                        setAddress('');
                    }}>
                        Cerrar
                    </Button>
                    <Button variant="primary" disabled={!isValid} onClick={handleSave}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={deleteModal} onHide={() => setDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que quieres eliminar este contacto?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(currentRecord)}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={updateModal} onHide={() => setUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmación de Actualización</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    El contacto ha sido actualizado exitosamente.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setUpdateModal(false)}>
                        Aceptar
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={createModal} onHide={() => setCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmación de Creación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    El contacto ha sido creado exitosamente.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setCreateModal(false)}>
                        Aceptar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Contact;
