// server/src/models/Document.js
import mongoose from 'mongoose';
import Vehicle from './Vehicle.js';

export const DOCUMENT_TYPES = {
  vtv: {
    label: 'VTV',
    scope: 'vehicle',
    defaultPeriodicity: 'anual',
    defaultReminderDays: 30,
    renewalUrl: 'https://www.suvtv.com.ar/turnos', // Turnos oficiales VTV CABA
  },
  taxi_license: {
    label: 'Licencia de taxi',
    scope: 'vehicle',
    defaultPeriodicity: 'anual',
    defaultReminderDays: 30,
    renewalUrl: 'https://buenosaires.gob.ar/tramites/renovacion-de-licencia-de-conducir', // Trámite GCBA
  },
  driver_license: {
    label: 'Licencia de conducir',
    scope: 'user',
    defaultPeriodicity: 'anual',
    defaultReminderDays: 60,
    renewalUrl: 'https://buenosaires.gob.ar/tramites/renovacion-de-licencia-de-conducir', // Trámite GCBA
  },
  insurance: {
    label: 'Seguro',
    scope: 'vehicle',
    defaultPeriodicity: 'mensual',
    defaultReminderDays: 15,
    renewalUrl: 'https://www.argentina.gob.ar/superintendencia-de-seguros', // SSN (info y consultas)
  },
  gnc_sticker: {
    label: 'Oblea GNC',
    scope: 'vehicle',
    defaultPeriodicity: 'anual',
    defaultReminderDays: 30,
    renewalUrl: 'https://www.enargas.gov.ar/secciones/gas-natural-comprimido/renovacion-obleas-gnc.php', // ENARGAS
  },
  hydraulic_test: {
    label: 'Prueba hidráulica',
    scope: 'vehicle',
    defaultPeriodicity: 'quinquenal',
    defaultReminderDays: 90,
    renewalUrl: 'https://tallermec.com.ar', // Taller CV en CABA (ejemplo de taller habilitado)
  },
};

export const PERIODICITIES = [
  'mensual',
  'bimestral',
  'trimestral',
  'semestral',
  'anual',
  'bianual',
  'trienal',
  'cuatrienal',
  'quinquenal',
];

export const PERIOD_TO_MONTHS = {
  mensual: 1,
  bimestral: 2,
  trimestral: 3,
  semestral: 6,
  anual: 12,
  bianual: 24,
  trienal: 36,
  cuatrienal: 48,
  quinquenal: 60,
};

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.keys(DOCUMENT_TYPES),
      index: true,
    },
    number: { type: String, trim: true, default: '' },
    issuedBy: { type: String, trim: true, default: '' },
    issueDate: { type: Date, required: true },
    periodicity: {
      type: String,
      enum: PERIODICITIES,
      default: 'anual',
    },
    expiresAt: { type: Date, default: null, index: true },
    reminderDays: { type: Number, min: 0, default: 30 },
    acknowledgedAt: { type: Date, default: null },
    acknowledgedAtDaysRemaining: { type: Number, default: null },
    renewalUrl: { type: String, trim: true, default: '' },
    attachments: [
      {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    archivedAt: { type: Date, default: null },
    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    replaces: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

documentSchema.index({ owner: 1, type: 1, isActive: 1 });
documentSchema.index({ vehicle: 1, type: 1, isActive: 1 });
documentSchema.index({ owner: 1, isActive: 1, expiresAt: 1 });

documentSchema.virtual('typeLabel').get(function () {
  return DOCUMENT_TYPES[this.type]?.label ?? this.type;
});

documentSchema.virtual('daysUntilExpiration').get(function () {
  if (!this.expiresAt) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((this.expiresAt.getTime() - Date.now()) / msPerDay);
});

documentSchema.virtual('rawStatus').get(function () {
  if (!this.isActive) return 'archivado';
  const days = this.daysUntilExpiration;
  if (days === null) return 'vigente';
  if (days < 0) return 'vencido';
  if (days <= this.reminderDays) return 'por_vencer';
  return 'vigente';
});

documentSchema.virtual('status').get(function () {
  const raw = this.rawStatus;
  if (raw === 'vigente' || raw === 'archivado') return raw;
  if (!this.acknowledgedAt) return raw;

  const days = this.daysUntilExpiration;
  const ackDays = this.acknowledgedAtDaysRemaining;

  if (days < 0 && (ackDays === null || ackDays >= 0)) return 'vencido';

  if (days >= 0 && ackDays !== null) {
    if (days <= 7 && ackDays > 7) return raw;
    return 'vigente';
  }

  return raw;
});

documentSchema.virtual('needsAttention').get(function () {
  const s = this.status;
  return s === 'vencido' || s === 'por_vencer';
});

documentSchema.pre('validate', function (next) {
  // Auto-completar renewalUrl desde DOCUMENT_TYPES si viene vacía
  if (!this.renewalUrl || !String(this.renewalUrl).trim()) {
    const meta = DOCUMENT_TYPES[this.type];
    if (meta?.renewalUrl) {
      this.renewalUrl = meta.renewalUrl;
    }
  }

  // Auto-calcular expiresAt
  if (
    !this.expiresAt &&
    this.issueDate &&
    this.periodicity &&
    PERIOD_TO_MONTHS[this.periodicity]
  ) {
    const nextDate = new Date(this.issueDate);
    nextDate.setMonth(nextDate.getMonth() + PERIOD_TO_MONTHS[this.periodicity]);
    this.expiresAt = nextDate;
  }
  next();
});

documentSchema.pre('validate', function (next) {
  const meta = DOCUMENT_TYPES[this.type];
  if (meta?.scope === 'vehicle' && !this.vehicle) {
    return next(
      new Error(`El documento "${meta.label}" debe estar asociado a un vehículo`)
    );
  }
  next();
});

documentSchema.methods.renew = async function (overrides = {}) {
  if (overrides.odometer && this.vehicle) {
    await Vehicle.updateOne(
      { _id: this.vehicle, owner: this.owner },
      { $set: { odometer: overrides.odometer } }
    );
  }

  const newDoc = new this.constructor({
    owner: this.owner,
    vehicle: this.vehicle,
    type: this.type,
    number: overrides.number ?? this.number,
    issuedBy: overrides.issuedBy ?? this.issuedBy,
    issueDate: overrides.issueDate ?? new Date(),
    periodicity: overrides.periodicity ?? this.periodicity,
    reminderDays: overrides.reminderDays ?? this.reminderDays,
    renewalUrl: overrides.renewalUrl ?? this.renewalUrl,
    notes: overrides.notes ?? '',
    replaces: this._id,
  });

  await newDoc.save();

  this.isActive = false;
  this.archivedAt = new Date();
  this.replacedBy = newDoc._id;
  await this.save();

  return newDoc;
};

documentSchema.methods.acknowledge = async function () {
  this.acknowledgedAt = new Date();
  this.acknowledgedAtDaysRemaining = this.daysUntilExpiration;
  await this.save();
  return this;
};

documentSchema.statics.findNeedingAttention = async function (ownerId) {
  const docs = await this.find({ owner: ownerId, isActive: true })
    .populate('vehicle', 'brand model plate')
    .sort({ expiresAt: 1 });
  return docs.filter((d) => d.needsAttention);
};

documentSchema.statics.findHistory = function (ownerId, type, vehicleId = null) {
  const query = { owner: ownerId, type };
  if (vehicleId) query.vehicle = vehicleId;
  return this.find(query).sort({ issueDate: -1 });
};

const Document = mongoose.model('Document', documentSchema);
export default Document;