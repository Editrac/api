import mongoose from "mongoose";
import { IOrganisation, OrganisationType } from '../@types/organisation-type';

export type OrganisationDocument = mongoose.Document & IOrganisation

const organisationSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  organisationType: {
    type: String,
    default: OrganisationType.EDITING,
    enum: Object.values(OrganisationType)
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
    type: mongoose.Types.ObjectId,
    ref: 'Organisation',
    required: true
  }],
  editingOrgs: [{
    type: mongoose.Types.ObjectId,
    ref: 'Organisation',
    required: true
  }]
}, { timestamps: true });

export const Organisation = mongoose.model<OrganisationDocument>("Organisation", organisationSchema);
