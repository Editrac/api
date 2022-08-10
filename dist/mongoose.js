"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMongoConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const util_1 = __importDefault(require("util"));
const bluebird_1 = __importDefault(require("bluebird"));
const config_1 = require("./config");
const winston_1 = __importDefault(require("./winston"));
const debug = require('debug')('mongo');
// plugin bluebird promise in mongoose
mongoose_1.default.Promise = bluebird_1.default;
exports.createMongoConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // connect to mongo db
        const mongoUri = config_1.config.mongoUri;
        yield mongoose_1.default.connect(mongoUri, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        for (let index = 0; index < mongoose_1.default.modelNames().length; index++) {
            const model = mongoose_1.default.modelNames()[index];
            yield mongoose_1.default.model(model).createIndexes();
        }
        winston_1.default.info('Connected to db');
    }
    catch (error) {
        throw error;
    }
});
// print mongoose logs in dev env
if (config_1.config.mongooseDebug) {
    mongoose_1.default.set('debug', (collectionName, method, query, doc) => {
        debug(`${collectionName}.${method}`, util_1.default.inspect(query, false, 20), doc);
    });
}
