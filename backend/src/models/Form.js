import mongoose from 'mongoose';

const FormFieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'short_text',
        'long_text',
        'number',
        'phone',
        'email',
        'date',
        'time',
        'dropdown',
        'radio',
        'checkbox',
        'multi_select',
        'yes_no',
        'file_upload',
        'image_upload',
        'signature',
        'address',
        'date_of_birth',
        'consent',
      ],
    },
    label: { type: String, required: true },
    placeholder: { type: String, default: '' },
    description: { type: String, default: '' },
    required: { type: Boolean, default: false },
    defaultValue: { type: mongoose.Schema.Types.Mixed, default: '' },
    options: [{ type: String }], // For dropdown, radio, multi_select
    validation: {
      min: { type: Number },
      max: { type: Number },
      minLength: { type: Number },
      maxLength: { type: Number },
      pattern: { type: String },
    },
    conditionalLogic: {
      enabled: { type: Boolean, default: false },
      dependsOnFieldId: { type: String, default: '' },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'is_not_empty'],
        default: 'equals',
      },
      value: { type: String, default: 'yes' },
      action: {
        type: String,
        enum: ['show', 'hide'],
        default: 'show',
      },
    },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const FormSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Form title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    fields: [FormFieldSchema],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

FormSchema.index({ clinicId: 1, slug: 1 }, { unique: true });

export const Form = mongoose.model('Form', FormSchema);
