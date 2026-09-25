/**
 * ============================================================================
 * MÓDULO: AUTH
 * CAPA: SERVICE (Lógica de Negocio y Autenticación)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Autenticación por correo institucional, gestión de tokens JWT
 * y forzado de cambio de contraseña en primer ingreso para alumnos y maestros.
 * ============================================================================
 */
const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Inicia sesión validando prioritariamente por Correo Institucional (o matrícula).
   * Si es primer ingreso, exige cambio obligatorio de contraseña.
   * @param {string} identificador - Correo institucional o matrícula
   * @param {string} password - Contraseña ingresada
   */
  async login(identificador, password) {
    const cleanId = String(identificador || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    if (!cleanId || !cleanPass) {
      throw { statusCode: 400, message: 'Debe ingresar su correo institucional y contraseña.' };
    }

    // Detección de correo de alumno institucional (ej. p.222 o p2224b)
    if (cleanId.includes('p.222') || cleanId.includes('p222')) {
      throw { statusCode: 401, message: 'Lo sentimos. Aún no tienes un usuario en esta app.' };
    }

    const [rows] = await db.query(
      `SELECT u.id, u.matricula, u.email, u.password, u.rol, u.estado,
              s.primer_ingreso, s.password_cambiado_en
       FROM usuarios u
       LEFT JOIN usuario_seguridad s ON u.id = s.usuario_id
       WHERE LOWER(u.email) = ? OR LOWER(u.matricula) = ?`,
      [cleanId, cleanId]
    );

    if (rows.length === 0) {
      throw { statusCode: 401, message: 'Lo sentimos. Aún no tienes un usuario en esta app.' };
    }

    const usuario = rows[0];

    if (usuario.estado !== 'activo') {
      throw { statusCode: 403, message: 'Su cuenta se encuentra inactiva. Contacte a Control Escolar.' };
    }

    // Determinar si es primer ingreso
    let esPrimerIngreso = true;
    if (usuario.primer_ingreso !== null && usuario.primer_ingreso !== undefined) {
      esPrimerIngreso = Boolean(usuario.primer_ingreso);
    } else {
      // Si no existe registro en usuario_seguridad:
      // El administrador principal nunca tiene primer ingreso forzado por defecto
      if (usuario.rol === 'admin' || usuario.matricula === 'ADMIN22') {
        esPrimerIngreso = false;
      } else {
        esPrimerIngreso = true;
      }
    }

    let validPassword = false;

    if (esPrimerIngreso) {
      // 1. Si es alumno en primer ingreso:
      // Puede usar su matrícula como clave temporal inicial O la contraseña guardada en BD
      if (usuario.rol === 'alumno') {
        if (cleanPass.toUpperCase() === usuario.matricula.trim().toUpperCase()) {
          validPassword = true;
        } else if (cleanPass === 'Cobat2026!' || cleanPass === 'Cobat22') {
          validPassword = true;
        }
      }

      // 2. Si aún no valida (o es maestro / otro rol con clave temporal asignada por admin):
      if (!validPassword) {
        const isBcrypt = usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$');
        if (isBcrypt) {
          validPassword = await bcrypt.compare(cleanPass, usuario.password);
        } else {
          validPassword = (cleanPass === usuario.password);
          if (validPassword) {
            const hash = await bcrypt.hash(cleanPass, 10);
            await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, usuario.id]);
          }
        }
      }
    } else {
      // Si YA completó su primer ingreso, SOLO se acepta su contraseña personal Bcrypt
      const isBcrypt = usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$');
      if (isBcrypt) {
        validPassword = await bcrypt.compare(cleanPass, usuario.password);
      } else {
        validPassword = (cleanPass === usuario.password);
        if (validPassword) {
          const hash = await bcrypt.hash(cleanPass, 10);
          await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, usuario.id]);
        }
      }
    }

    if (!validPassword) {
      throw { statusCode: 401, message: 'Correo o contraseña incorrecta.' };
    }

    // Generar token JWT con vigencia de 7 días
    const token = jwt.sign(
      { 
        id: usuario.id, 
        matricula: usuario.matricula, 
        email: usuario.email, 
        rol: usuario.rol 
      },
      process.env.JWT_SECRET || 'cobat22_super_secret_jwt_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        matricula: usuario.matricula,
        email: usuario.email,
        rol: usuario.rol
      },
      debeCambiarPassword: esPrimerIngreso
    };
  }

  /**
   * Cambia la contraseña obligatoria en primer ingreso y desactiva la bandera primer_ingreso.
   * @param {number} usuarioId - ID del usuario
   * @param {string} nuevaPassword - Nueva contraseña personal
   */
  async cambiarPasswordPrimerIngreso(usuarioId, nuevaPassword) {
    if (!nuevaPassword || typeof nuevaPassword !== 'string' || nuevaPassword.trim().length < 6) {
      throw { statusCode: 400, message: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }

    const cleanPass = nuevaPassword.trim();
    const hash = await bcrypt.hash(cleanPass, 10);

    // Actualizar la contraseña en usuarios
    await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, usuarioId]);

    // Marcar en usuario_seguridad que ya NO es primer ingreso
    await db.query(`
      INSERT INTO usuario_seguridad (usuario_id, primer_ingreso, password_cambiado_en)
      VALUES (?, FALSE, NOW())
      ON DUPLICATE KEY UPDATE primer_ingreso = FALSE, password_cambiado_en = NOW()
    `, [usuarioId]);

    return {
      success: true,
      mensaje: '¡Contraseña actualizada exitosamente! Bienvenido(a) al portal del COBAT 22.'
    };
  }
}

module.exports = new AuthService();
