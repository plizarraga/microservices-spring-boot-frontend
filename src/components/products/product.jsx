import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Table,
} from 'react-bootstrap';
import ErrorModal from '../error/error.jsx';

function Product() {
  const GRAPHQL_PRODUCTS_URL = process.env.REACT_APP_GRAPHQL_PRODUCTS_URL;

  const [edit, setEdit] = useState(false);
  const [show, setShow] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState();
  const [price, setPrice] = useState('');
  const [data, setData] = useState([]);
  const [currentRecord, setCurrentRecord] = useState([]);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  const isValidSKU = (sku) => {
    const skuPattern = /^SKU.{3}$/;
    return skuPattern.test(sku);
  };

  const handleShow = () => {
    setEdit(false);
    setShow(true);
  };

  const handleSave = async () => {
    try {
      if (
        !sku ||
        !name ||
        !description ||
        status === '' ||
        !price ||
        !categoryId
      ) {
        setError('Todos los campos son obligatorios');
        return;
      }
      if (isNaN(parseFloat(price))) {
        setError('El precio debe ser un número válido');
        return;
      }
      if (!isValidSKU(sku)) {
        setError('SKU debe ser de 6 caracteres y empezar con "SKU"');
        return;
      }
      const booleanStatus = status === 'Activo' ? true : false;

      const inputProduct = {
        sku,
        name,
        description,
        status: booleanStatus,
        price: parseFloat(price),
        categoryId,
      };
      const inputProductUpdate = {
        sku,
        name,
        description,
        status: booleanStatus,
        price: parseFloat(price),
        categoryId,
      };
      setError('');

      if (edit == true) {
        const result = await fetch(GRAPHQL_PRODUCTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
                        mutation UpdateProduct($productId: String!, $inputProduct: InputProductUpdate!) {
                            updateProduct(productId: $productId, inputProduct: $inputProduct) {
                                id
                                sku
                                name
                                description
                                status
                                price
                                category {
                                    id
                                    name
                                }
                            }
                        }
                        `,
            variables: {
              productId: currentRecord.id,
              inputProduct,
            },
          }),
        });

        const { data: responseData } = await result.json();
        if (responseData && responseData.updateProduct) {
          const updatedData = data.map((item) =>
            item.id === currentRecord.id
              ? { id: currentRecord.id, ...inputProduct }
              : item
          );
          setData(updatedData);
          setUpdateModal(true);
        }
      } else {
        const result = await fetch(GRAPHQL_PRODUCTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
                        mutation CreateProduct($inputProduct: InputProduct!) {
                            createProduct(inputProduct: $inputProduct) {
                                id
                                sku
                                name
                                description
                                status
                                price
                                category {
                                    id
                                    name
                                }
                            }
                        }
                        `,
            variables: {
              inputProduct,
            },
          }),
        });

        const { data } = await result.json();
        if (data && data.createProduct) {
          const newProduct = {
            id: data.createProduct.id,
            ...inputProduct,
          };
          setData((prevData) => [...prevData, newProduct]);
          setShow(false);
          setCreateModal(true);
        }
      }
      setShow(false);
      setEdit(false);
      setSku('');
      setName('');
      setDescription('');
      setStatus();
      setPrice('');
      setCategoryId('');
    } catch (error) {
      setError(error.message);
      setShowErrorModal(true);
    }
  };

  const fetchCategories = async () => {
    const result = await fetch(GRAPHQL_PRODUCTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
                query {
                    findAllCategories {
                        id
                        name
                    }
                }
                `,
      }),
    });

    const { data } = await result.json();
    console.log(data); // Imprimir datos en consola

    if (data && data.findAllCategories) {
      setCategories(data.findAllCategories);
      console.log(data); // Imprimir datos en consola
    }
  };

  const handleDeleteConfirmation = (record) => {
    setCurrentRecord(record);
    setDeleteModal(true);
  };

  const handleDelete = async (record) => {
    try {
      const result = await fetch(GRAPHQL_PRODUCTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
                    mutation DeleteProduct($productId: String!) {
                        deleteProduct(productId: $productId)
                    }
                    `,
          variables: {
            productId: record.id,
          },
        }),
      });

      const response = await result.json();
      if (response.data && response.data.deleteProduct) {
        const updatedData = data.filter((item) => item.id !== record.id);
        setData(updatedData);
      }
      setDeleteModal(false);
    } catch (error) {
      setError(error.message);
      setShowErrorModal(true);
    }
  };

  const handleEdit = (item) => {
    setCurrentRecord(item);
    setSku(item.sku);
    setName(item.name);
    setDescription(item.description);
    setStatus();
    setCategoryId('');
    setPrice(item.price);
    setEdit(true);
    setShow(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch(GRAPHQL_PRODUCTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
                        query {
                            findAllProducts {
                                id
                                sku
                                name
                                description
                                status
                                price
                                category {
                                    id
                                    name
                                }
                            }
                        }
                    `,
          }),
        });

        const { data } = await result.json();
        if (data && data.findAllProducts) {
          setData(data.findAllProducts);
        }
      } catch (error) {
        setError(error.message);
        setShowErrorModal(true);
      }
    };
    fetchCategories();
    try {
      fetchData();
    } catch (error) {
      setError(error.message);
      setShowErrorModal(true);
    }
  }, []);

  try {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <h1 className="text-center mt-5" style={{ fontSize: '3em' }}>
              ¡Bienvenidos a nuestros productos!
            </h1>
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
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.status ? 'Activo' : 'Inactivo'}</td>
                    <td>{item.price}</td>
                    <td>
                      <Button
                        variant="primary"
                        style={{ marginRight: '10px' }}
                        onClick={() => handleEdit(item)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteConfirmation(item)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button variant="primary" onClick={handleShow}>
              Crear Producto
            </Button>
          </Col>
        </Row>

        <Modal
          show={show}
          onHide={() => {
            setShow(false);
            setEdit(false);
            setEdit(false);
            setSku('');
            setName('');
            setDescription('');
            setStatus();
            setPrice('');
            setCategoryId('');
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {edit ? 'Editar Producto' : 'Crear Producto'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formBasicSku">
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formBasicName">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formBasicDescription">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese descripción"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formBasicStatus">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  as="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option selected value="">
                    Seleccione uno
                  </option>
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formBasicPrice">
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingrese precio"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formBasicCategory">
                <Form.Label>Categoría</Form.Label>
                <Form.Control
                  as="select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option selected value="">
                    Seleccione uno
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form>
            {error && <Alert variant="danger">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShow(false);
                setEdit(false);
                setSku('');
                setName('');
                setDescription('');
                setStatus();
                setPrice('');
                setCategoryId('');
              }}
            >
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!sku || !name || !description || !status || !price}
            >
              {edit ? 'Actualizar' : 'Crear'}
            </Button>
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
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(currentRecord)}
            >
              Eliminar
            </Button>
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
            <Button variant="success" onClick={() => setUpdateModal(false)}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={createModal} onHide={() => setCreateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Creación exitosa</Modal.Title>
          </Modal.Header>
          <Modal.Body>¡El producto ha sido creado exitosamente!</Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={() => setCreateModal(false)}>
              OK
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
  } catch (error) {
    setError(error.message);
    setShowErrorModal(true);
    return (
      <ErrorModal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        error={error}
      />
    );
  }
}

export default Product;
