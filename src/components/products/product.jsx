import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from "axios";

function Product() {

    const [edit, setEdit] = useState(false);
    const [show, setShow] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [price, setPrice] = useState('');
    const [data, setData] = useState([]);
    const [currentRecord, setCurrentRecord] = useState([]);
    const [error, setError] = useState('');

    const handleShow = () => {
        setEdit(false);
        setShow(true);
    };

    const handleSave = () => {
        if (!sku || !name || !description || !status || !price) {
            setError('Todos los campos son obligatorios');
            return;
        }
        const booleanStatus = status === 'Activo' ? true : false;
        setError('');

        if (edit == true) {
            axios.put(`http://localhost:8081/api/product/${currentRecord.id}`, {
                sku: sku,
                name: name,
                description: description,
                status: booleanStatus,
                price: price,
            })
                .then(response => {
                    const updatedData = data.map(item => item.id === currentRecord.id ? { id: currentRecord.id, sku, name, description, status, price } : item);
                    setData(updatedData);
                    setUpdateModal(true);
                })
                .catch(error => {
                    console.error("There was an error updating the record: ", error);
                });
            setEdit(false);
        }
        else {
            axios.post('http://localhost:8081/api/product', {
                sku: sku,
                name: name,
                description: description,
                status: booleanStatus,
                price: price,
            })
                .then((response) => {
                    const newProduct = {
                        id: data.length + 1,
                        sku: sku,
                        name: name,
                        description: description,
                        status: booleanStatus,
                        price: price,
                    };
                    setData(prevData => [...prevData, newProduct]);
                    setShow(false);
                    setCreateModal(true);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
        setShow(false);
        setEdit(false);
        setSku('');
        setName('');
        setDescription('');
        setStatus('');
        setPrice('');
    };

    const handleDeleteConfirmation = (record) => {
        setCurrentRecord(record);
        setDeleteModal(true);
    };

    const handleDelete = (record) => {
        axios.delete(`http://localhost:8081/api/product/${record.id}`)
            .then(response => {
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
        setSku(item.sku);
        setName(item.name);
        setDescription(item.description);
        setStatus(item.status);
        setPrice(item.price);
        setEdit(true);
        setShow(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios('http://localhost:8081/api/product');
            setData(result.data);
        };
        fetchData();
    }, []);

    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <h1 className="text-center mt-5" style={{ fontSize: '3em' }}>¡Bienvenidos a nuestros productos!</h1>
                    <p className="text-center mt-4">
                        Aquí puedes ver todos nuestros productos.
                    </p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.id}>
                                    <td>{item.sku}</td>
                                    <td>{item.name}</td>
                                    <td>{item.description}</td>
                                    <td>{item.status ? 'Activo' : 'Inactivo'}</td>
                                    <td>{item.price}</td>
                                    <td>
                                        <Button  variant="primary" style={{ marginRight: '10px' }} onClick={() => handleEdit(item)}>Editar</Button>
                                        <Button variant="danger" onClick={() => handleDeleteConfirmation(item)}>Eliminar</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col><Button variant="primary" onClick={handleShow}>Crear Producto</Button></Col>
            </Row>

            <Modal show={show} onHide={() => { setShow(false);                        setEdit(false);
                        setEdit(false);
                        setSku('');
                        setName('');
                        setDescription('');
                        setStatus('');
                        setPrice('');}}>
                <Modal.Header closeButton>
                    <Modal.Title>{edit ? "Editar Producto" : "Crear Producto"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formBasicSku">
                            <Form.Label>SKU</Form.Label>
                            <Form.Control type="text" placeholder="Ingrese SKU" value={sku} onChange={e => setSku(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="formBasicName">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" placeholder="Ingrese nombre" value={name} onChange={e => setName(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="formBasicDescription">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control type="text" placeholder="Ingrese descripción" value={description} onChange={e => setDescription(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="formBasicStatus">
                            <Form.Label>Estado</Form.Label>
                            <Form.Control as="select" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="">Seleccione el estado</option>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formBasicPrice">
                            <Form.Label>Precio</Form.Label>
                            <Form.Control type="number" placeholder="Ingrese precio" value={price} onChange={e => setPrice(e.target.value)} />
                        </Form.Group>
                    </Form>
                    {error && <Alert variant="danger">{error}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShow(false);
                        setEdit(false);
                        setSku('');
                        setName('');
                        setDescription('');
                        setStatus('');
                        setPrice('');
                    }}>Cerrar</Button>
                    <Button variant="primary" onClick={handleSave} disabled={!sku || !name || !description || !status || !price}>{edit ? "Actualizar" : "Crear"}</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={deleteModal} onHide={() => setDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que quieres eliminar este elemento?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={() => handleDelete(currentRecord)}>Eliminar</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={updateModal} onHide={() => setUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Actualización exitosa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¡El producto ha sido actualizado exitosamente!
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={() => setUpdateModal(false)}>OK</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={createModal} onHide={() => setCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Creación exitosa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¡El producto ha sido creado exitosamente!
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={() => setCreateModal(false)}>OK</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Product;
