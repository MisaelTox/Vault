/**
 * Crea la tabla vault-games en DynamoDB.
 * Correr una sola vez: npm run create-table
 */
import { DynamoDBClient, CreateTableCommand, ResourceInUseException } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";
dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function createTable() {
  try {
    await client.send(
      new CreateTableCommand({
        TableName: process.env.DYNAMO_TABLE_NAME || "vault-games",
        KeySchema: [
          { AttributeName: "vaultId", KeyType: "HASH" },  // siempre "shared"
          { AttributeName: "gameId",  KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          { AttributeName: "vaultId", AttributeType: "S" },
          { AttributeName: "gameId",  AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      })
    );
    console.log("✅ Tabla vault-games creada exitosamente.");
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log("ℹ️  La tabla ya existe, no se hizo nada.");
    } else {
      console.error("❌ Error creando tabla:", error);
      process.exit(1);
    }
  }
}

createTable();
