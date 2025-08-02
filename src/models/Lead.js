import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    zipCode: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        // enum: ['auto-insurance-quote-form', 'home-insurance-quote-form', 'mortgage-protection-quote-form'] // Can be expanded as more form types are added
    },
    status: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    state: {
        type: String,
        default: ''
    },
    saleCount: {
        type: Number,
        default: 0
    },
    maxLeadSaleCount: {
        type: Number,
        default: 3
    },
    formId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;