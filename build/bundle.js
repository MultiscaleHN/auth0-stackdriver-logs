"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@google-cloud/logging");
const auth0_extension_tools_1 = require("auth0-extension-tools");
const auth0_log_extension_tools_1 = require("auth0-log-extension-tools");
const config = auth0_extension_tools_1.config();
const main = ctx => {
    const auth0logger = new auth0_log_extension_tools_1.LogsProcessor(ctx.storage, {
        domain: config("AUTH0_DOMAIN"),
        clientId: config("AUTH0_CLIENT_ID"),
        clientSecret: config("AUTH0_CLIENT_SECRET"),
        batchSize: parseInt(config("BATCH_SIZE")),
        startFrom: config("START_FROM"),
        logTypes: config("LOG_TYPES"),
        logLevel: config("LOG_LEVEL")
    });
    const logging = new logging_1.Logging({
        projectId: config("GCLOUD_PROJECT_ID"),
        credentials: {
            client_email: config("GOOGLE_CLOUD_CLIENT_EMAIL"),
            private_key: config("GOOGLE_CLOUD_PRIVATE_KEY")
        }
    });
    const logName = config("GCLOUD_LOG_NAME");
    const log = logging.log(logName);
    const resource = {
        type: "global",
        labels: {
            name: logName
        }
    };
    return auth0logger.run((logs, callback) => {
        if (!logs || !logs.length) {
            return callback();
        }
        const entries = logs.map(log => {
            // A structured log entry
            return log.entry({ resource: resource }, log);
        });
        log
            .write(entries)
            .then(result => {
            callback(null, result);
        })
            .catch(err => {
            callback(err);
        });
    });
};
module.exports = (context, cb) => {
    main(context)
        .then(() => cb(null, {}))
        .catch(err => cb(err));
};
