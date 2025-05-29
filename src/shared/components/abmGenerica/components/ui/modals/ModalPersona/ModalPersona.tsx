// Importación de las dependencias necesarias
import { Button, Modal } from 'react-bootstrap';
import * as Yup from 'yup';

import { IPersona } from '../../../../types/IPersona';
import TextFieldValue from '../../TextFildValue/TextFildValue';
import { Form, Formik } from 'formik';
import { PersonaService } from '../../../../services/PersonaService';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux';
import { removeElementActive } from '../../../../redux/slices/TablaReducer';
const API_URL = import.meta.env.BACK_API_BASE_URL;

// Interfaz para los props del componente ModalPersona
interface IModalPersona {
  getPersonas: Function; // Función para obtener las personas
  openModal: boolean;
  setOpenModal: (state: boolean) => void;
}

// Definición del componente ModalPersona
export const ModalPersona = ({ getPersonas, openModal, setOpenModal }: IModalPersona) => {
  // Valores iniciales para el formulario
  const initialValues: IPersona = {
    id: `${new Date().getMilliseconds().toFixed(2)}`,
    phoneNumber: '',
    adress: '',
    birthdate: '' as any,
    email: '',
    firstName: '',
    lastName: '',
  };

  // URL de la API obtenida desde las variables de entorno
  const actualDate: string = new Date().toISOString().split('T')[0];
  const apiPersona = new PersonaService(API_URL + '/personas');

  const elementActive = useAppSelector((state) => state.tablaReducer.elementActive);
  const dispatch = useAppDispatch();

  // Función para cerrar el modal
  const handleClose = () => {
    setOpenModal(false);
    dispatch(removeElementActive());
  };

  return (
    <div>
      {/* Componente Modal de React Bootstrap */}
      <Modal
        id={'modal'}
        show={openModal}
        onHide={handleClose}
        size={'lg'}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          {/* Título del modal dependiendo de si se está editando o añadiendo una persona */}
          {elementActive ? (
            <Modal.Title>Editar una persona:</Modal.Title>
          ) : (
            <Modal.Title>Añadir una persona:</Modal.Title>
          )}
        </Modal.Header>
        <Modal.Body>
          {/* Componente Formik para el formulario */}
          <Formik
            validationSchema={Yup.object({
              phoneNumber: Yup.string().required('Campo requerido'),
              adress: Yup.string().required('Campo requerido'),
              birthdate: Yup.date()
                .required('Campo requerido')
                .max(actualDate, 'La fecha no puede ser mayor a la fecha actual'),
              email: Yup.string()
                .email('Tiene que ser un correo electrónico válido')
                .required('Campo requerido'),
              firstName: Yup.string().required('Campo requerido'),
              lastName: Yup.string().required('Campo requerido'),
            })}
            initialValues={elementActive ? elementActive : initialValues}
            enableReinitialize={true}
            onSubmit={async (values: IPersona) => {
              // Enviar los datos al servidor al enviar el formulario
              if (elementActive) {
                await apiPersona.put(elementActive?.id, values);
              } else {
                await apiPersona.post(values);
              }
              // Obtener las personas actualizadas y cerrar el modal
              getPersonas();
              handleClose();
            }}
          >
            {() => (
              <>
                {/* Formulario */}
                <Form autoComplete="off" className="form-obraAlta">
                  <div className="container_Form_Ingredientes">
                    {/* Campos del formulario */}
                    <TextFieldValue
                      label="Nombre:"
                      name="firstName"
                      type="text"
                      placeholder="Nombre"
                    />
                    <TextFieldValue
                      label="Apellido:"
                      name="lastName"
                      type="text"
                      placeholder="Apellido"
                    />

                    <TextFieldValue
                      label="Correo electrónico:"
                      name="email"
                      type="text"
                      placeholder="Mail"
                    />

                    <TextFieldValue
                      label="Dirección:"
                      name="adress"
                      type="text"
                      placeholder="Direccion"
                    />
                    <TextFieldValue
                      label="Número de teléfono:"
                      name="phoneNumber"
                      type="number"
                      placeholder="Numero de telefono"
                    />
                    <TextFieldValue
                      label="Fecha de nacimiento:"
                      name="birthdate"
                      type="date"
                      placeholder="Fecha de nacimiento"
                    />
                  </div>
                  {/* Botón para enviar el formulario */}
                  <div className="d-flex justify-content-end">
                    <Button variant="success" type="submit">
                      Enviar
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
};
