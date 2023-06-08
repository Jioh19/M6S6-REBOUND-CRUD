const yargs = require("yargs");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs/promises");
const ARCHIVO = "tareas.txt";

//* Función getFile para todas las instancias de fs.readFile junto con try catch... no se
//* esta es la forma correcta de usar try catch, pero hace su pega
const getFile = async () => {
	try {
		const tareas = await fs.readFile(ARCHIVO);
		return (arrayTareas = JSON.parse(tareas));
	} catch (err) {
		console.log(`Error en getFile()`);
		console.error(err);
	}
};

const createConfig = {
	titulo: {
		describe: "El nombre de la tarea a realizar",
		alias: "t",
		demandOption: true,
	},
	contenido: {
		describe: "Descripción de la tarea a realizar",
		alias: "c",
		demandOption: true,
	},
};

const updateConfig = {
	titulo: {
		describe: "Nuevo nombre de la tarea a realizar",
		alias: "t",
	},
	contenido: {
		describe: "Nueva descripción de la tarea a realizar",
		alias: "c",
	},
	id: {
		describe: "El id de la tarea a actualizar o modificar",
		alias: "i",
		demandOption: true,
	},
};

const deleteConfig = {
	id: {
		describe: "El id o identificador de la tarea a eliminar",
		alias: "d",
		demandOption: true,
	},
};

//* Pensaba hacer un try catch para cada instancia que se llame al "fs", pero creo que ya seria
//* exagerado, dado que con lo que hay es suficiente para ubicar el error
const functionCreate = async ({ titulo, contenido }) => {
	const id = uuidv4().slice(0, 8);
	const nuevaTarea = { id: id, titulo: titulo, contenido: contenido };
	const arrayTareas = await getFile();
	try {
		arrayTareas.push(nuevaTarea);
		await fs.writeFile(ARCHIVO, JSON.stringify(arrayTareas, null, 2));
		console.log("Nueva tarea agregada");
	} catch (err) {
		console.log("Error en functionCreate()");
		console.error(err);
	}
};

const functionRead = async () => {
	const arrayTareas = await getFile();
	let contador = 0;
	try {
		for (tareas of arrayTareas) {
			const { titulo, contenido, id } = tareas;
			contador++;
			console.log(`Tarea numero ${contador}:`);
			console.log(`- Titulo: ${titulo}`);
			console.log(`- Contenido: ${contenido}`);
			console.log(`- id: ${id}`);
			console.log("");
		}
	} catch (err) {
		console.log("Error en functionRead()");
		console.error(err);
	}
};

//* Se agrego validacion de ID según el índice retornado por la función findIndex()
const functionUpdate = async ({ id, titulo, contenido }) => {
	const arrayTareas = await getFile();
	try {
		const tareaActual = arrayTareas.findIndex((tarea) => tarea.id === id);
		if (tareaActual > 0) {
			const tituloNuevo = titulo ? titulo : arrayTareas[tareaActual].titulo;
			const contenidoNuevo = contenido ? contenido : arrayTareas[tareaActual].contenido;
			arrayTareas[tareaActual].titulo = tituloNuevo;
			arrayTareas[tareaActual].contenido = contenidoNuevo;
			await fs.writeFile(ARCHIVO, JSON.stringify(arrayTareas, null, 2));
			console.log("Tu tarea ha sido actualizada");
		} else {
			console.log(`No se ha encontrado la tarea ${id}`);
		}
	} catch (err) {
		console.log("Error en functionUpdate()");
		console.error(err);
	}
};

//* No se si ess más eficiente hacer un findIndex() o hacer la comparación entre largo de arreglos.
//* Hice la comparación entre arreglos por facilidad de código y porque creo que esto es más eficiente.
const functionDelete = async ({ id }) => {
	const arrayTareas = await getFile();
	try {
		const nuevasTareas = arrayTareas.filter((tareas) => tareas.id !== id);
		if (nuevasTareas.length == arrayTareas.length) {
			console.log(`No se ha encontrado la tarea ${id}`);
		} else {
			await fs.writeFile(ARCHIVO, JSON.stringify(nuevasTareas, null, 2));
			console.log("La tarea ha sido eliminada exitosamente");
		}
	} catch (err) {
		console.log("Error en functionDelete()");
		console.error(err);
	}
};

const args = yargs
	.command("create", "Crear una nueva tarea", createConfig, (argv) => functionCreate(argv))
	.command("read", "Mostrar todas las tareas", {}, () => functionRead())
	.command("update", "Actualizar o modificar una tarea", updateConfig, (argv) => functionUpdate(argv))
	.command("delete", "Eliminar una tarea", deleteConfig, (argv) => functionDelete(argv))
	.help().argv;
