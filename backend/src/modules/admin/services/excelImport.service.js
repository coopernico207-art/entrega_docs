/**
 * ============================================================================
 * MÓDULO: ADMIN (Importador Masivo de Alumnos vía Excel)
 * CAPA: SERVICE (Capa de Negocio y Procesamiento de Datos)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Parseo del archivo Excel oficial de alumnos, generación de contraseñas y registro optimizado por lotes.
 * ============================================================================
 */
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const db = require('../../../config/db');

class ExcelImportService {
  generarPasswordAleatoria() {
    const digitos = Math.floor(1000 + Math.random() * 9000);
    return 'Cobat!' + digitos;
  }

  async importarAlumnosDesdeExcel(input, sobreescribirPasswords = false) {
    let workbook;
    if (Buffer.isBuffer(input)) {
      workbook = xlsx.read(input, { type: 'buffer' });
    } else {
      workbook = xlsx.readFile(input);
    }

    const sheetName = workbook.SheetNames.includes('CORREOS') ? 'CORREOS' : workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (!rawRows || rawRows.length < 4) {
      throw new Error('El archivo Excel no tiene el formato esperado o está vacío.');
    }

    const filasDatos = rawRows.slice(3);
    
    // 1. Obtener usuarios existentes
    const [usuariosExistentes] = await db.query('SELECT id, matricula FROM usuarios');
    const userMap = new Map();
    for (const u of usuariosExistentes) {
      userMap.set(u.matricula.toUpperCase(), u.id);
    }

    let creados = 0;
    let actualizados = 0;
    let omitidos = 0;
    const usuariosGenerados = [];

    // 2. Pre-procesar filas y calcular datos
    const nuevosAlumnos = [];
    const paraActualizar = [];

    for (let i = 0; i < filasDatos.length; i++) {
      const fila = filasDatos[i];
      if (!fila || fila.length === 0) continue;

      const rawMatricula = fila[1];
      const rawNombreCompleto = fila[2];
      const rawGrupo = fila[3];
      const rawCorreo = fila[4];

      if (!rawMatricula || !rawCorreo) {
        omitidos++;
        continue;
      }

      const matricula = String(rawMatricula).trim().toUpperCase();
      const email = String(rawCorreo).trim().toLowerCase();
      const nombreCompleto = String(rawNombreCompleto || '').trim();
      const grupo = String(rawGrupo || '101').trim();

      const grupoNum = parseInt(grupo.replace(/\D/g, ''), 10) || 101;
      const semestre = Math.floor(grupoNum / 100) || 1;
      const subGrupo = grupoNum % 100;
      const turno = (subGrupo >= 7) ? 'vespertino' : 'matutino';

      const partesNombre = nombreCompleto.split(' ');
      let apellidos = '';
      let nombre = '';
      if (partesNombre.length >= 3) {
        apellidos = partesNombre[0] + ' ' + partesNombre[1];
        nombre = partesNombre.slice(2).join(' ');
      } else if (partesNombre.length === 2) {
        apellidos = partesNombre[0];
        nombre = partesNombre[1];
      } else {
        apellidos = 'Pendiente';
        nombre = nombreCompleto || matricula;
      }

      const alumnoData = {
        matricula,
        email,
        nombreCompleto,
        apellidos,
        nombre,
        grupo,
        semestre,
        turno
      };

      if (!userMap.has(matricula)) {
        nuevosAlumnos.push(alumnoData);
      } else {
        paraActualizar.push({ ...alumnoData, usuarioId: userMap.get(matricula) });
      }
    }

    // 3. Procesar nuevos alumnos en lotes (chunks) de 50 para no saturar memoria/CPU
    const CHUNK_SIZE = 50;
    for (let i = 0; i < nuevosAlumnos.length; i += CHUNK_SIZE) {
      const chunk = nuevosAlumnos.slice(i, i + CHUNK_SIZE);
      
      // Hashear contraseñas en paralelo dentro del chunk
      const processedChunk = await Promise.all(chunk.map(async (item) => {
        const plainPassword = this.generarPasswordAleatoria();
        const hash = await bcrypt.hash(plainPassword, 8); // Salt rounds 8 para balance perfecto velocidad/seguridad
        return {
          ...item,
          plainPassword,
          hash
        };
      }));

      // Insertar usuarios del chunk
      for (const item of processedChunk) {
        try {
          const [resUser] = await db.query(
            'INSERT INTO usuarios (matricula, email, password, rol, estado) VALUES (?, ?, ?, ?, ?)',
            [item.matricula, item.email, item.hash, 'alumno', 'activo']
          );
          const userId = resUser.insertId;
          userMap.set(item.matricula, userId);

          await db.query(
            'INSERT INTO alumnos (usuario_id, nombre, apellidos, curp, grupo, semestre, turno, capacitacion) VALUES (?, ?, ?, NULL, ?, ?, ?, ?)',
            [userId, item.nombre, item.apellidos, item.grupo, item.semestre, item.turno, 'tics']
          );

          creados++;
          usuariosGenerados.push({
            matricula: item.matricula,
            email: item.email,
            nombre: item.apellidos + ' ' + item.nombre,
            grupo: item.grupo,
            passwordGenerada: item.plainPassword
          });
        } catch (err) {
          console.error('[Error insertando alumno]', item.matricula, err.message);
        }
      }
    }

    // 4. Actualizar existentes si aplica
    for (const item of paraActualizar) {
      try {
        if (sobreescribirPasswords) {
          const plainPassword = this.generarPasswordAleatoria();
          const hash = await bcrypt.hash(plainPassword, 8);
          await db.query('UPDATE usuarios SET email = ?, password = ? WHERE id = ?', [item.email, hash, item.usuarioId]);
          usuariosGenerados.push({
            matricula: item.matricula,
            email: item.email,
            nombre: item.apellidos + ' ' + item.nombre,
            grupo: item.grupo,
            passwordGenerada: plainPassword
          });
        } else {
          await db.query('UPDATE usuarios SET email = ? WHERE id = ?', [item.email, item.usuarioId]);
        }

        await db.query(
          `INSERT INTO alumnos (usuario_id, nombre, apellidos, curp, grupo, semestre, turno, capacitacion)
           VALUES (?, ?, ?, NULL, ?, ?, ?, 'tics')
           ON DUPLICATE KEY UPDATE nombre = ?, apellidos = ?, grupo = ?, semestre = ?, turno = ?`,
          [item.usuarioId, item.nombre, item.apellidos, item.grupo, item.semestre, item.turno,
           item.nombre, item.apellidos, item.grupo, item.semestre, item.turno]
        );
        actualizados++;
      } catch (err) {
        console.error('[Error actualizando alumno]', item.matricula, err.message);
      }
    }

    return {
      status: 'success',
      mensaje: `Importación completada con éxito: ${creados} nuevos alumnos registrados, ${actualizados} actualizados, ${omitidos} omitidos.`,
      resumen: {
        totalFilas: filasDatos.length,
        creados,
        actualizados,
        omitidos,
        erroresCount: 0
      },
      usuariosGeneradosMuestra: usuariosGenerados.slice(0, 25),
      totalGenerados: usuariosGenerados.length
    };
  }
}

module.exports = new ExcelImportService();
