import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { env } from "../config/env";
import { Game } from "../models/game.model";

const client = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE = env.DYNAMO_TABLE_NAME;
const VAULT_ID = "shared";

export const DynamoService = {
  async getAllGames(filterByUser?: string): Promise<Game[]> {
    const expressionValues: Record<string, string> = { ":vid": VAULT_ID };
    if (filterByUser) expressionValues[":user"] = filterByUser;

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "vaultId = :vid",
        FilterExpression: filterByUser ? "addedBy = :user" : undefined,
        ExpressionAttributeValues: expressionValues,
        ScanIndexForward: false,
      })
    );
    return (result.Items as Game[]) ?? [];
  },

  async putGame(game: Game): Promise<void> {
    await docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: { vaultId: VAULT_ID, gameId: game.id, ...game },
      })
    );
  },

  async updateStatus(gameId: string, status: string): Promise<void> {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { vaultId: VAULT_ID, gameId },
        UpdateExpression: "SET #s = :status",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":status": status },
      })
    );
  },

  async deleteGame(gameId: string): Promise<void> {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { vaultId: VAULT_ID, gameId },
      })
    );
  },
};
