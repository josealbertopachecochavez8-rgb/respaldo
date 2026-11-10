export async function POST(req: Request) {
  try {
    const { curp, password } = await req.json();
    
    // 1. Intentar validar con la contraseña normal
    const [rows]: any = await pool.query(
      'SELECT * FROM empleados WHERE UPPER(curp) = UPPER(?) AND password = ?',
      [curp, password]
    );
    
    if (rows.length > 0) {
      return NextResponse.json({ success: true, data: rows[0] });
    } 

    // 2. SI FALLA: Verificar si es una contraseña temporal válida
    // Buscamos el correo asociado a esa CURP primero (ajusta según tu BD)
    const [empleado] = await pool.query('SELECT correo_institucional FROM empleados WHERE UPPER(curp) = UPPER(?)', [curp]);
    
    if (empleado.length > 0) {
      const email = empleado[0].correo_institucional;
      
      const [tokenValido]: any = await pool.query(
        'SELECT * FROM tokens_recuperacion WHERE correo_usuario = ? AND token_temporal = ? AND utilizado = 0 AND fecha_expiracion > NOW()',
        [email, password] // Aquí usamos la 'password' que el usuario ingresó como si fuera el token
      );

      if (tokenValido.length > 0) {
        // Marcamos el token como usado
        await pool.query('UPDATE tokens_recuperacion SET utilizado = 1 WHERE id = ?', [tokenValido[0].id]);
        
        // Retornamos éxito indicando que entró con clave temporal
        return NextResponse.json({ success: true, data: { ...empleado[0], temporal: true } });
      }
    }

    return NextResponse.json({ success: false, message: 'CURP o contraseña incorrecta' });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al conectar con la base de datos' });
  }
}