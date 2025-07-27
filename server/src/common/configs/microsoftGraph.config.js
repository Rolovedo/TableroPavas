import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../common/configs/db.config.js";
import {
  Client,
  LargeFileUploadTask,
  FileUpload,
} from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";

const microsoftConnection = () => {
  return new Promise(async (resolve, reject) => {
    let connection = null;
    try {
      connection = await getConnection();

      const resultsQuery = await executeQuery(
        `SELECT reg_tenant_id tenantId, reg_client_id clientId, reg_client_secret clientSecret FROM tbl_reglas LIMIT 1`,
        [],
        connection
      );

      if (!resultsQuery.length > 0)
        return reject("Error a consultar credenciales de base de dato");

      const TENANT_ID = resultsQuery[0].tenantId;
      const CLIENT_ID = resultsQuery[0].clientId;
      const CLIENT_SECRET = resultsQuery[0].clientSecret;

      const credential = new ClientSecretCredential(
        TENANT_ID,
        CLIENT_ID,
        CLIENT_SECRET
      );
      const authProvider = new TokenCredentialAuthenticationProvider(
        credential,
        { scopes: [".default"] }
      );

      const client = Client.initWithMiddleware({
        debugLogging: true,
        authProvider,
      });

      resolve(client);
    } catch (error) {
      reject(error);
    } finally {
      releaseConnection(connection);
    }
  });
};

const getRulesSharepoint = () => {
  return new Promise(async (resolve, reject) => {
    let connection = null;
    try {
      connection = await getConnection();
      const resultsQuery = await executeQuery(
        `SELECT reg_tenant_id tenantId, reg_client_id clienteId, reg_client_secret clientSecret, reg_usuario userSharepoint, reg_carpeta folderSharePoint FROM tbl_reglas LIMIT 1`
      );

      if (!resultsQuery.length > 0)
        return reject("Error a consultar credenciales en base de dato");

      const { userSharepoint, folderSharePoint } = resultsQuery[0];
      if (!userSharepoint)
        return reject("No hay un usuario de SharePoint seleccionado");

      if (!folderSharePoint)
        return reject("No hay un folder de SharePoint seleccionado");

      resolve(resultsQuery[0]);
    } catch (error) {
      reject(error);
    } finally {
      releaseConnection(connection);
    }
  });
};

export {
  microsoftConnection,
  LargeFileUploadTask,
  FileUpload,
  getRulesSharepoint,
};
