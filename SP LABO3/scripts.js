class Persona {
    constructor(id, nombre, apellido, fechaNacimiento) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
    }

    mostrarDatos() {
        return `ID: ${this.id}, Nombre: ${this.nombre}, Apellido: ${this.apellido}, Fecha de Nacimiento: ${this.fechaNacimiento}`;
    }
}

class Ciudadano extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, dni) {
        super(id, nombre, apellido, fechaNacimiento);
        this.dni = dni;
    }

    mostrarDatos() {
        return `${super.mostrarDatos()}, DNI: ${this.dni}`;
    }
}

class Extranjero extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, paisOrigen) {
        super(id, nombre, apellido, fechaNacimiento);
        this.paisOrigen = paisOrigen;
    }

    mostrarDatos() {
        return `${super.mostrarDatos()},País: ${this.paisOrigen}`;
    }
}

function validarFormulario() {
    const nombre = document.getElementById("Nombreinput").value.trim();
    const apellido = document.getElementById("Apellidoinput").value.trim();
    const fechaNacimiento = document.getElementById("fechaNacimientoinput").value.trim();

    if (nombre === '') {
        alert("El nombre no puede estar vacío.");
        return false;
    }

    if (apellido === '') {
        alert("El apellido no puede estar vacío.");
        return false;
    }

    if (fechaNacimiento === '') {
        alert("La fecha de nacimiento no puede estar vacía.");
        return false;
    }

    return true;
}

document.addEventListener("DOMContentLoaded", function() {
    const tabla = document.getElementById("tabla_personas");
    const cuerpoTabla = document.getElementById("datos_tabla");
    const spinnerContainer = document.getElementById("spinnerContainer");
    const formularioABM = document.getElementById("abm");
    const formularioLista = document.getElementById("FormDatos");
    let personasArray = [];

    function mostrarSpinner() {
        spinnerContainer.style.display = "flex";
    }

    function ocultarSpinner() {
        spinnerContainer.style.display = "none";
    }

    function cargarDatosDesdeAPI() {
        fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero")
            .then(response => response.json())
            .then(datos => {
                personasArray = datos.map(persona => {
                    if (persona.dni !== undefined) {
                        return new Ciudadano(persona.id, persona.nombre, persona.apellido, persona.fechaNacimiento, persona.dni);
                    } else {
                        return new Extranjero(persona.id, persona.nombre, persona.apellido, persona.fechaNacimiento, persona.paisOrigen);
                    }
                });
                mostrarDatosEnTabla();
            })
            .catch(() => alert("Error al cargar los datos desde la API."));
    }

    function mostrarDatosEnTabla() {
        cuerpoTabla.innerHTML = "";

        personasArray.forEach(persona => {
            const fila = document.createElement("tr");

            const id = document.createElement("td");
            id.textContent = persona.id;

            const nombre = document.createElement("td");
            nombre.textContent = persona.nombre || "N/A";

            const apellido = document.createElement("td");
            apellido.textContent = persona.apellido || "N/A";

            const fechaNacimiento = document.createElement("td");
            fechaNacimiento.textContent = persona.fechaNacimiento || "N/A";

            const dni = document.createElement("td");
            dni.textContent = persona.dni || "N/A";

            const paisOrigen = document.createElement("td");
            paisOrigen.textContent = persona.paisOrigen || "N/A";

            const modificar = document.createElement("td");

            const btnModificar = document.createElement("button");
            btnModificar.textContent = "Modificar";
            btnModificar.classList.add("modificar");
            modificar.appendChild(btnModificar);

            const eliminar = document.createElement("td");
            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "Eliminar";
            btnEliminar.classList.add("eliminar");
            eliminar.appendChild(btnEliminar);

            fila.appendChild(id);
            fila.appendChild(nombre);
            fila.appendChild(apellido);
            fila.appendChild(fechaNacimiento);
            fila.appendChild(dni);
            fila.appendChild(paisOrigen);
            fila.appendChild(modificar);
            fila.appendChild(eliminar);
            cuerpoTabla.appendChild(fila);

            btnModificar.onclick = () => {
                mostrarFormularioABM("Modificar", persona);
            };

            btnEliminar.onclick = () => {
                mostrarFormularioABM("Eliminar", persona);
            };
        });
    }

    cargarDatosDesdeAPI();

    document.getElementById("RegistrarABM").onclick = () => {
        mostrarFormularioABM("Alta");
    };

    function mostrarFormularioABM(accion, persona = {}) {
        formularioLista.style.display = "none";
        formularioABM.style.display = "block";
        formularioABM.querySelector("h1").textContent = `Formulario ${accion}`;
        document.getElementById("IDinput").value = persona.id || "";
        document.getElementById("Nombreinput").value = persona.nombre || "";
        document.getElementById("Apellidoinput").value = persona.apellido || "";
        document.getElementById("fechaNacimientoinput").value = persona.fechaNacimiento || "";
        document.getElementById("opcionesinput").value = persona.dni ? "Ciudadano" : "Extranjero";
        document.getElementById("DNIinput").value = persona.dni || "";
        document.getElementById("paisOrigeninput").value = persona.paisOrigen || "";

        const btnAgregarRegistro = document.getElementById("btnAgregarRegistro");
        btnAgregarRegistro.textContent = (accion === "Modificar" || accion === "Eliminar") ? "Confirmar" : "Agregar";

        const fieldsToToggle = ["Nombreinput", "Apellidoinput", "fechaNacimientoinput", "DNIinput", "paisOrigeninput"];
        fieldsToToggle.forEach(field => document.getElementById(field).disabled = (accion === "Eliminar"));

        btnAgregarRegistro.onclick = () => {
            if (accion === "Alta" || accion === "Modificar") {
                if (validarFormulario()) {
                    if (accion === "Alta") {
                        agregarElemento().then(() => {
                            ocultarSpinner();
                            mostrarFormularioLista();
                        }).catch(() => {
                            alert("No se pudo realizar la operación.");
                            ocultarSpinner();
                            mostrarFormularioLista();
                        });
                    } else if (accion === "Modificar") {
                        modificarElemento(persona.id).then(() => {
                            ocultarSpinner();
                            mostrarFormularioLista();
                        }).catch((error) => {
                            alert("No se pudo realizar la operación.");
                            ocultarSpinner();
                            mostrarFormularioLista();
                        });
                    }
                }
            } else if (accion === "Eliminar") {
                eliminarElemento(persona.id);
            }
        };

        document.getElementById("cancelar").onclick = () => {
            ocultarSpinner();
            mostrarFormularioLista();
        };
    }

    function mostrarFormularioLista() {
        formularioLista.style.display = "block";
        formularioABM.style.display = "none";
    }

    function agregarElemento() {
        mostrarSpinner();
        const data = obtenerDatosFormulario();
        delete data.id; 

        return new Promise((resolve, reject) => {
            fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("Error en la respuesta del servidor.");
                }
            })
            .then(newData => {
                data.id = personasArray.length ? Math.max(...personasArray.map(p => p.id)) + 1 : 1; 

                if (data.dni !== undefined) {
                    const newCiudadano = new Ciudadano(data.id, data.nombre, data.apellido, data.fechaNacimiento, data.dni);
                    personasArray.push(newCiudadano);
                } else {
                    const newExtranjero = new Extranjero(data.id, data.nombre, data.apellido, data.fechaNacimiento,  data.paisOrigen);
                    personasArray.push(newExtranjero);
                }
                mostrarDatosEnTabla();
                resolve();
            })
            .catch(error => {
                console.error(error);
                reject();
            });
        });
    }

    // function modificarElemento(id) {
    //     const data = obtenerDatosFormulario();
    //     const index = personasArray.findIndex(persona => persona.id === id);
    //     if (index !== -1) {
    //         if (data.dni !== undefined) {
    //             personasArray[index] = new Ciudadano(id, data.nombre, data.apellido, data.fechaNacimiento, data.dni);
    //         } else {
    //             personasArray[index] = new Extranjero(id, data.nombre, data.apellido, data.fechaNacimiento,  data.paisOrigen);
    //         }
    //         mostrarDatosEnTabla();
    //         mostrarFormularioLista();
    //     } else {
    //         alert("Elemento no encontrado para modificar.");
    //     }
    // }

    
    // function modificarElemento(id) {
    //     const data = obtenerDatosFormulario();
    //     const index = personasArray.findIndex(persona => persona.id === id);
    //     if (index !== -1) {
    //         return new Promise((resolve, reject) => {
    //             try {
    //                 mostrarSpinner();
    
    //                 setTimeout(() => {
    //                     if (data.dni !== undefined) {
    //                         personasArray[index] = new Ciudadano(id, data.nombre, data.apellido, data.fechaNacimiento, data.dni);
    //                     } else {
    //                         personasArray[index] = new Extranjero(id, data.nombre, data.apellido, data.fechaNacimiento, data.paisOrigen);
    //                     }
    //                     mostrarDatosEnTabla();
    //                     mostrarFormularioLista();
    //                     resolve();
    //                 }, 1000); 
    
    //             } catch (error) {
    //                 console.error('Error en la solicitud:', error);
    //                 alert("Error al modificar el elemento.");
    //                 reject(error);
    //             } finally {
    //                 ocultarSpinner();
    //             }
    //         });
    //     } else {
    //         alert("Elemento no encontrado para modificar.");
    //         return Promise.reject(new Error("Elemento no encontrado para modificar."));
    //     }
    // }
    async function modificarElemento(id) {
        const data = obtenerDatosFormulario();
        const index = personasArray.findIndex(persona => persona.id === id);
        if (index !== -1) {
            mostrarSpinner();
    
            try {
                const response = await fetch('https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id,
                        nombre: data.nombre,
                        apellido: data.apellido,
                        fechaNacimiento: data.fechaNacimiento,
                        ...(data.dni ? { dni: data.dni } : { paisOrigen: data.paisOrigen })
                    })
                });
    
                if (response.status === 200) {
                    if (data.dni !== undefined) {
                        personasArray[index] = new Ciudadano(id, data.nombre, data.apellido, data.fechaNacimiento, data.dni);
                    } else {
                        personasArray[index] = new Extranjero(id, data.nombre, data.apellido, data.fechaNacimiento, data.paisOrigen);
                    }
                    mostrarDatosEnTabla();
                    mostrarFormularioLista();
                } else {
                    alert("No se pudo realizar la operación.");
                    mostrarFormularioLista();
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                alert("Error al modificar el elemento.");
            } finally {
                ocultarSpinner();
            }
        } else {
            alert("Elemento no encontrado para modificar.");
            return Promise.reject(new Error("Elemento no encontrado para modificar."));
        }
    }



    async function eliminarElemento(id) {
        try {
            mostrarSpinner();
            const response = await fetch(`https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: id })
            });

            if (response.ok) {
                personasArray = personasArray.filter(persona => persona.id !== id);
                mostrarDatosEnTabla();
                mostrarFormularioLista();
            } else {
                alert("Error al eliminar el elemento.");
                mostrarDatosEnTabla();
                mostrarFormularioLista();
            }
        } catch (error) {
            alert("Error al eliminar el elemento.");
        } finally {
            ocultarSpinner();
        }
    }

    function obtenerDatosFormulario() {
        const nombre = document.getElementById("Nombreinput").value.trim();
        const apellido = document.getElementById("Apellidoinput").value.trim();
        const fechaNacimiento = document.getElementById("fechaNacimientoinput").value.trim();
        const tipoElementoSelect = document.getElementById("opcionesinput").value;
        let data = { nombre, apellido, fechaNacimiento};

        if (tipoElementoSelect === "Ciudadano") {
            data.dni = document.getElementById("DNIinput").value.trim();
            
        } else if (tipoElementoSelect === "Extranjero") {
            data.paisOrigen = document.getElementById("paisOrigeninput").value.trim();

        }

        return data;
    }
});
