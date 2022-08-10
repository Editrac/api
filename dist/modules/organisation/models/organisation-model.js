"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organisation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const organisation_type_1 = require("../@types/organisation-type");
const organisationSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
    },
    organisationType: {
        type: String,
        default: organisation_type_1.OrganisationType.EDITING,
        enum: Object.values(organisation_type_1.OrganisationType)
    },
    picture: {
        type: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
    },
    producingOrgs: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Organisation',
            required: true
        }],
    editingOrgs: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Organisation',
            required: true
        }]
}, { timestamps: true });
exports.Organisation = mongoose_1.default.model("Organisation", organisationSchema);
