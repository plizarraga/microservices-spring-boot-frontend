import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import ErrorModal from '../error/error.jsx'

function Contact() {
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [number, setNumber] = useState('');
    const [description, setDescription] = useState('');
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [data, setData] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showModalPhone, setShowModalPhone] = useState(false);
    const [modalType, setModalType] = useState('');
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [phoneNumberToAdd, setPhoneNumberToAdd] = useState({ number: '', description: '' });


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.post('https://microservices-contacts.azurewebsites.net/graphql', {
                query: `
          query {
            findAllContacts {
              id
              name
              email
              address
              phoneNumbers {
                id
                number
                description
              }
            }
          }
        `
            });

            if (response.status === 200) {
                setData(response.data.data.findAllContacts);
            } else {
                throw new Error('Failed to fetch contacts.');
            }
        } catch (error) {
            handleError(error);
        }
    };

    
    const handleCreateContact = () => {
        setCurrentRecord(null);
        setName('');
        setEmail('');
        setAddress('');
        setPhoneNumbers([]);
        setShowModal(true);
        setModalType('create');
        setError('');
    };

    //const handleEditContact = (contact) => {//    setCurrentRecord(contact);//    setName(contact.name);//    setEmail(contact.email);//    setAddress(contact.address);//    setPhoneNumbers(contact.phoneNumbers.map(phone => ({
    //   id: phone.id,//      number: phone.number,//      description: phone.description//    })));//    setShowModal(true);//    setModalType('edit');//  };


    const emailValidation = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      };

    function isValidName(name) {
        const regex = /^[a-zA-Z\s]*$/;
        return regex.test(name);
    }

    function handleAddPhone(contactId) {
        setId(contactId);
        setShowModalPhone(true);
        setModalType('addPhone');
    }

    const handleDeleteContact = async (contact) => {
        try {
            const response = await axios.post('https://microservices-contacts.azurewebsites.net/graphql', {
                query: `
          mutation($contactId: String!) {
            deleteContact(contactId: $contactId)
          }
        `,
                variables: {
                    contactId: contact.id
                }
            });

            if (response.status === 200) {
                const deletedId = response.data.data.deleteContact;
                const updatedData = data.filter(item => item.id !== deletedId);
                setData(updatedData);
                fetchData(); // Fetch updated data after deleting contact
            } else {
                setError("No se pudo eliminar este registro revise con el administrador que ocurrio")
                setShowErrorModal(true);

            }
        } catch (error) {
            handleError(error);
            setShowErrorModal(true);

        }
    };

    const isNumeric = (str) => {
        return /^\d+$/.test(str);
      };

    const handleAddOrUpdatePhoneNumber = async () => {

        try {
            // Aquí agrego el ID del contacto al objeto phoneNumberToAdd
            const phoneNumberData = {
                number: phoneNumberToAdd.number,
                description: phoneNumberToAdd.description,
                contactId: id
            };
            
            if (!isNumeric(phoneNumberToAdd.number)) {
                setError('El número de teléfono solo debe contener dígitos numéricos.');
                setShowErrorModal(true);
                return;
              }
            
              if (!phoneNumberToAdd.number || !phoneNumberToAdd.description) {
                setError('Todos los campos son obligatorios.');
                setShowErrorModal(true);
                return;
              }

            const result = await fetch('https://microservices-contacts.azurewebsites.net/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        mutation CreatePhoneNumber($inputPhoneNumber: InputPhoneNumber!) {
                            createPhoneNumber(inputPhoneNumber: $inputPhoneNumber) {
                                id
                                number
                                description
                                contact {
                                    name
                                }
                            }
                        }
                        `,
                    variables: {
                        inputPhoneNumber: phoneNumberData
                    }
                }),
            });

            const { data } = await result.json();
            if (data && data.createPhoneNumber) {
                const newPhoneNumber = {
                    id: data.createPhoneNumber.id,
                    ...phoneNumberData
                };
                setPhoneNumbers(prevData => [...prevData, newPhoneNumber]);
                setShowModalPhone(false);
                setModalType('');
                fetchData();
                setError('');
            } else {
                setError("Error al actualizar el telefono revise los datos, recuerde que no puede duplicar registros telefonicos")
                setShowErrorModal(true);
            }


        } catch (error) {
            handleError(error);
            setError("Error al actualizar el telefono revise los datos, recuerde que no puede duplicar registros telefonicos")
            setShowErrorModal(true);
        }
        setPhoneNumberToAdd({ number: '', description: '' });
        setShowModalPhone(false);
    };



    const handleCreateOrUpdateContact = async () => {
        try {

            if (!isValidName(name)) {
                setError("El nombre solo debe contener letras y espacios");
                return;
            }

            if (!emailValidation(email)) {
                setError('El correo electrónico proporcionado no es válido.');
                return;
              }

              if (!name || !email || !address) {
                setError('Nombre, correo electrónico y dirección son campos obligatorios.');
                return;
              }

            const contactData = {
                name: name,
                email: email,
                address: address,
                phoneNumbers: phoneNumbers.map(phone => ({
                    id: phone.id,
                    number: phone.number,
                    description: phone.description
                }))
            };

            let response;

            if (modalType === 'create') {
                response = await axios.post('https://microservices-contacts.azurewebsites.net/graphql', {
                    query: `
          mutation CreateContact($inputContact: InputContact!) {
            createContact(inputContact: $inputContact) {
              id
              name
              email
              address
              phoneNumbers {
                id
                number
                description
              }
            }
          }
        `,
                    variables: {
                        inputContact: contactData
                    }
                });
            } else if (modalType === 'edit' && currentRecord) {
                response = await axios.post('https://microservices-contacts.azurewebsites.net/graphql', {
                    query: `
          mutation UpdateContact($contactId: ID!, $inputContact: InputContact!) {
            updateContact(id: $contactId, inputContact: $inputContact) {
              id
              name
              email
              address
              phoneNumbers {
                id
                number
                description
              }
            }
          }
        `,
                    variables: {
                        contactId: currentRecord.id,
                        inputContact: contactData
                    }
                });
            }

            if (response && response.data && response.data.data) {
                const updatedContact = modalType === 'create'
                    ? response.data.data.createContact
                    : response.data.data.updateContact;

                const updatedData = data.map(item => (item.id === updatedContact.id ? updatedContact : item));
                setData(updatedData);
                setShowModal(false);
                setModalType('');
                fetchData();
            } else {
                handleError("Error en los datos. revise los registros");
                throw new Error(modalType === 'create' ? 'Failed to create contact.' : 'Failed to update contact.');
                
            }
        } catch (error) {
            setError("Error en los datos. revise los registros");
            setShowErrorModal(true);
        }
    };


    const handleError = (error) => {
        setError(error.message);
        setShowErrorModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setShowModalPhone(false);
        setModalType('');
        setCurrentRecord(null);
        setName('');
        setEmail('');
        setAddress('');
        setPhoneNumbers([]);
        setError('');
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <h1 className="text-center mt-5" style={{ fontSize: '3em' }}>
                        ¡Bienvenidos a nuestros contactos!
                    </h1>
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
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.address}</td>
                            <td>
                                {item.phoneNumbers.map((phone) => (
                                    <div key={phone.id}>
                                        {phone.number} ({phone.description})
                                    </div>
                                ))}
                            </td>
                            <td>
                                <Button
                                    variant="secondary"
                                    style={{ marginRight: '10px' }}
                                    onClick={() => handleAddPhone(item.id)}
                                >
                                    Agregar Teléfono
                                </Button>
                                <Button
                                    variant="danger"
                                    style={{ marginRight: '10px' }}
                                    onClick={() => handleDeleteContact(item)}
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div className="d-flex align-items-center justify-content-center">
                <Button variant="primary" onClick={handleCreateContact}>
                    Crear contacto
                </Button>
            </div>
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalType === 'edit' ? 'Editar Contacto' : 'Crear Contacto'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingrese Nombre"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Ingrese Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAddress">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingrese Dirección"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </Form.Group>
                        {phoneNumbers.map((phone, index) => (
                            <div key={index}>
                                <Form.Group controlId={`formNumber${index}`}>
                                    <Form.Label>Número</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingrese Número"
                                        value={phone.number}
                                        onChange={(e) =>
                                            setPhoneNumbers((prevPhoneNumbers) =>
                                                prevPhoneNumbers.map((prevPhone, i) =>
                                                    i === index
                                                        ? { ...prevPhone, number: e.target.value }
                                                        : prevPhone
                                                )
                                            )
                                        }
                                    />
                                </Form.Group>
                                <Form.Group controlId={`formDescription${index}`}>
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={phone.description}
                                        onChange={(e) =>
                                            setPhoneNumbers((prevPhoneNumbers) =>
                                                prevPhoneNumbers.map((prevPhone, i) =>
                                                    i === index
                                                        ? { ...prevPhone, description: e.target.value }
                                                        : prevPhone
                                                )
                                            )
                                        }
                                    >
                                        <option value="">Seleccione tipo de número</option>
                                        <option value="Casa">Casa</option>
                                        <option value="Trabajo">Trabajo</option>
                                        <option value="Oficina">Oficina</option>
                                        <option value="Otro">Otro</option>
                                    </Form.Control>
                                </Form.Group>
                            </div>
                        ))}
                    </Form>
                    {error && <Alert variant="danger">{error}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handleCreateOrUpdateContact}>
                        {modalType === 'edit' ? 'Guardar' : 'Crear'}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showModalPhone} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Teléfono</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formNumber">
                            <Form.Label>Número</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingrese Número"
                                value={phoneNumberToAdd.number}
                                onChange={(e) => {
                                    setPhoneNumberToAdd({ ...phoneNumberToAdd, number: e.target.value });
                                    setNumber(e.target.value)
                                }}
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="select"
                                value={phoneNumberToAdd.description}
                                onChange={(e) => {
                                    setPhoneNumberToAdd({ ...phoneNumberToAdd, description: e.target.value });
                                    setDescription(e.target.value);
                                }
                                }
                            >
                                <option value="">Seleccione tipo de número</option>
                                <option value="Casa">Casa</option>
                                <option value="Trabajo">Trabajo</option>
                                <option value="Oficina">Oficina</option>
                                <option value="Otro">Otro</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handleAddOrUpdatePhoneNumber}>
                        Agregar
                    </Button>
                </Modal.Footer>
            </Modal>
            <ErrorModal
                show={showErrorModal}
                onHide={() => setShowErrorModal(false)}
                error={error}
            />
        </Container>
    );
}

export default Contact;