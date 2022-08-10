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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const method_override_1 = __importDefault(require("method-override"));
const cors_1 = __importDefault(require("cors"));
const http_status_1 = __importDefault(require("http-status"));
const express_winston_1 = __importDefault(require("express-winston"));
const helmet_1 = __importDefault(require("helmet"));
const express_jwt_1 = __importDefault(require("express-jwt"));
const glob_1 = __importDefault(require("glob"));
const mongodb_1 = require("mongodb");
const winston_1 = __importDefault(require("./winston"));
const config_1 = require("./config");
const error_1 = require("./error");
const mongoose_1 = require("./mongoose");
const enum_1 = require("./@types/enum");
const app = express_1.default();
// parse body params and attache them to req.body
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(compression_1.default());
app.use(method_override_1.default());
// secure apps by setting various HTTP headers
app.use(helmet_1.default());
// enable CORS - Cross Origin Resource Sharing
app.use(cors_1.default()); //TODO: Configure it properly
app.use(express_jwt_1.default({ secret: config_1.config.jwtSecret, algorithms: ['HS256'] })
    .unless({
    path: [
        '/health',
        '/api/auth/signin',
        '/api/auth/signup',
        '/api/auth/otp',
        '/api/cloudflare/signer'
    ]
}));
// enable detailed API logging in dev env
if (config_1.config.env === enum_1.Environment.Development) {
    express_winston_1.default.requestWhitelist.push('body');
    express_winston_1.default.responseWhitelist.push('body');
    app.use(express_winston_1.default.logger({
        winstonInstance: winston_1.default,
        meta: true,
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorize: true
    }));
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect mongodb database
        yield mongoose_1.createMongoConnection();
        // Start server
        app.listen(config_1.config.port, () => {
            winston_1.default.info(`server started on port ${config_1.config.port} (${config_1.config.env})`);
            app.get('/health', (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
                const healthcheck = {
                    success: true,
                    uptime: process.uptime(),
                    message: 'OK',
                    timestamp: Date.now()
                };
                return res.json(healthcheck);
            }));
            // Require all the routes
            const routes = glob_1.default.sync(`${__dirname}/modules/**/routes/*`);
            routes.forEach((route) => {
                require(route)(app);
            });
            // Require all the models
            // const models = glob.sync(`${__dirname}/modules/**/models/*`);
            // models.forEach((model) => {
            //   require(model);
            // });
            // Require all the message queues
            const mqs = glob_1.default.sync(`${__dirname}/mqs/**/*`, { nodir: true });
            mqs.forEach((mq) => {
                require(mq);
            });
            // if error is not an instanceOf APIError, convert it.
            app.use((err, _req, res, next) => {
                if (err.name === 'UnauthorizedError') {
                    return res.status(401).json({ success: false, message: 'Unauthorized request' });
                }
                if (err instanceof error_1.APIError) {
                    return res.status(err.status).json({ success: false, message: err.message });
                }
                if (err instanceof mongodb_1.MongoError) {
                    return next(new error_1.APIError(err.message, http_status_1.default.INTERNAL_SERVER_ERROR));
                }
                return next(new error_1.APIError(err.message, http_status_1.default.BAD_REQUEST));
            });
            // catch 404 and forward to error handler
            app.use((_req, _res, next) => {
                const err = new error_1.APIError('API not found', http_status_1.default.NOT_FOUND);
                return next(err);
            });
            // error handler, send stacktrace only during development
            app.use((err, _req, res, _next) => {
                return res.status(err.status).json(Object.assign({ success: false, message: err.message }, (config_1.config.env === enum_1.Environment.Development && { statck: err.stack })));
            });
        });
    }
    catch (error) {
        winston_1.default.error(error);
        process.exit(1);
    }
}))();
exports.default = app;
