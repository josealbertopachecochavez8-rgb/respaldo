import mongoose, { Schema, Document } from 'mongoose';

export interface IEmpleado extends Document {
  curp: string;
  paterno: string;
  materno: string;
  nombre: string;
  rfc: string;
  idEmpleado: string;
  area: string;
  plaza: string; // Plaza directa de la BD (BASE o CONFIANZA)
  correo: string;
  password?: string;
}

const EmpleadoSchema: Schema = new Schema({
  curp: { type: String, required: true, unique: true, uppercase: true },
  paterno: { type: String, required: true },
  materno: { type: String, required: true },
  nombre: { type: String, required: true },
  rfc: { type: String, required: true },
  idEmpleado: { type: String, required: true },
  area: { type: String, required: true },
  plaza: { type: String, required: true },
  correo: { type: String, required: true },
  password: { type: String, required: true }
});

export default mongoose.models.Empleado || mongoose.model<IEmpleado>('Empleado', EmpleadoSchema);