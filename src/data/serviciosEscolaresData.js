export const tramitesEscolares = [
  {
    id: "calendario-escolar",
    titulo: "Calendario Escolar Oficial 2026-B / 2027-A",
    categoria: "Documento Oficial",
    descripcion: "Consulta y descarga el calendario escolar oficial firmado que rige los periodos de clases, evaluaciones parciales, recesos y días inhábiles en el COBAT Plantel 22.",
    icono: "Calendar",
    color: "from-[#ab0033] to-[#8b002a]",
    pdfUrl: "/CALENDARIO_ESCOLAR_2026B_2027A.pdf",
    btnText: "Ver / Descargar PDF Oficial",
    puntosClave: [
      "Inicio y fin oficial de ciclo escolar",
      "Fechas de exámenes parciales y finales",
      "Periodos vacacionales y días de asueto oficial",
      "Jornadas académicas y de capacitación docente"
    ]
  },
  {
    id: "inscripciones-reinscripciones",
    titulo: "Inscripciones y Reinscripciones",
    categoria: "Control Escolar",
    descripcion: "Guía de trámites para alumnos de reingreso (semestres pares y nones) y formalización de matrícula escolar en ventanillas del plantel.",
    icono: "CheckCircle",
    color: "from-[#1e3a8a] to-[#1e40af]",
    btnText: "Consultar Requisitos y Fechas",
    puntosClave: [
      "No adeudo de asignaturas ni material de laboratorio/biblioteca",
      "Ficha de pago bancaria debidamente sellada",
      "Actualización de datos del tutor en Control Escolar",
      "Horario de atención según rol de semestre y turno"
    ],
    requisitos: [
      "Comprobante original de cuota de inscripción/reinscripción",
      "Ficha de reinscripción debidamente requisitada",
      "Historial académico o boleta de calificaciones del semestre anterior",
      "Copia de CURP actualizada del alumno",
      "Copia de INE del padre, madre o tutor legal",
      "Comprobante de domicilio no mayor a 3 meses"
    ]
  },
  {
    id: "preinscripcion",
    titulo: "Preinscripción (Nuevo Ingreso)",
    categoria: "Aspirantes a Bachillerato",
    descripcion: "Proceso de admisión dirigido a alumnos que cursan o han concluido su 3er año de secundaria y desean integrarse a los Leones del COBAT Plantel 22.",
    icono: "GraduationCap",
    color: "from-[#065f46] to-[#047857]",
    btnText: "Ver Convocatoria de Admisión",
    puntosClave: [
      "Registro de aspirantes y expedición de ficha de admisión",
      "Guía temática para el examen de ingreso",
      "Asignación de turno (Matutino / Vespertino)",
      "Publicación de listas de alumnos aceptados"
    ],
    requisitos: [
      "Constancia de estudios de 3er grado de secundaria con promedio general o Certificado de Secundaria",
      "Copia certificada del Acta de Nacimiento",
      "CURP en formato reciente descargada de RENAPO",
      "Comprobante de domicilio reciente (luz o agua)",
      "2 Fotografías tamaño infantil blanco y negro o color recientes",
      "Copia de identificación oficial del padre de familia o tutor"
    ]
  }
];

export const canalesAtencionEscolar = {
  horarios: {
    matutino: "07:00 AM - 01:30 PM",
    vespertino: "01:30 PM - 07:50 PM"
  },
  correo: "plantel22@cobat.edu.mx",
  ubicacion: "Edificio Administrativo, Ventanillas de Control Escolar",
  telefono: "899 926 0022"
};
