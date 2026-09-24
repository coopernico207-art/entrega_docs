export const examenesData = {
  parciales: [
    {
      id: "parcial-1",
      titulo: "1er Examen Parcial",
      periodo: "22 al 26 de Septiembre 2026",
      indicaciones: "Presentarse con uniforme oficial completo, credencial y guía de estudio resuelta.",
      materias: [
        { fecha: "22 Sep", hora: "08:00 AM / 01:30 PM", asignatura: "Matemáticas / Pensamiento Matemático", semestres: "2º, 4º, 6º" },
        { fecha: "23 Sep", hora: "08:00 AM / 01:30 PM", asignatura: "Lengua y Comunicación / Literatura", semestres: "2º, 4º, 6º" },
        { fecha: "24 Sep", hora: "08:00 AM / 01:30 PM", asignatura: "Ciencias Naturales / Física / Química", semestres: "2º, 4º, 6º" },
        { fecha: "25 Sep", hora: "08:00 AM / 01:30 PM", asignatura: "Capacitación para el Trabajo", semestres: "4º, 6º" },
        { fecha: "26 Sep", hora: "08:00 AM / 01:30 PM", asignatura: "Inglés / Cultura Digital", semestres: "2º, 4º, 6º" }
      ]
    },
    {
      id: "parcial-2",
      titulo: "2do Examen Parcial",
      periodo: "20 al 24 de Octubre 2026",
      indicaciones: "Evaluación acumulativa del segundo bloque semestral.",
      materias: []
    },
    {
      id: "ee1-ee2",
      titulo: "Evaluaciones Especiales (EE1 / EE2)",
      periodo: "Noviembre 2026",
      indicaciones: "Exámenes extraordinarios y de regularización especial.",
      materias: []
    }
  ],
  recursamiento: {
    titulo: "Exámenes de Recursamiento",
    periodoRegistro: "01 al 05 de Octubre 2026",
    periodoAplicacion: "10 al 14 de Octubre 2026",
    requisitos: [
      "No adeudar más de 3 materias del semestre inmediato anterior",
      "Comprobante de pago sellado por recursos financieros",
      "Ficha de registro de Control Escolar"
    ]
  }
};
