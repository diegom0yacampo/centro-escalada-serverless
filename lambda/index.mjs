// Lambda vertice-contact · Misión Serverless (Vértice Rocódromo)
// API Gateway → Lambda → DynamoDB (persistir) → SNS (notificar)

// DynamoDB: persistencia.
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

// SNS: mensajería publish/subscribe.
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import crypto from 'crypto';

const ddb = new DynamoDBClient({});
const sns = new SNSClient({});

const TABLE_NAME = 'VerticeSolicitudes';

// Topic ARN de VerticeNotificaciones (no es una credencial: sólo identifica el topic).
const TOPIC_ARN = 'arn:aws:sns:us-east-1:267636056084:VerticeNotificaciones';

export const handler = async (event) => {
  console.log('Evento HTTP recibido:', JSON.stringify(event));

  // Preflight CORS, por si alguna vez llega a la Lambda.
  const method = event.httpMethod ?? event.requestContext?.http?.method;
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  // Un JSON mal formado es un error del cliente (400), no del servidor (500).
  let body;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return response(400, { success: false, error: 'El cuerpo no es JSON válido' });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();

  if (!name || !email) {
    return response(400, { success: false, error: 'Name y email son obligatorios' });
  }

  try {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const phone = String(body.phone ?? 'N/A');
    const message = String(body.message ?? 'Solicitud de sesión de prueba');

    // 1 · PERSISTIMOS la solicitud.
    await ddb.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id:        { S: id },
        name:      { S: name },
        email:     { S: email },
        phone:     { S: phone },
        message:   { S: message },
        timestamp: { S: timestamp }
      }
    }));

    console.log('Item guardado:', id);

    // 2 · PUBLICAMOS que ha ocurrido una nueva solicitud.
    // El asunto de SNS no admite saltos de línea y debe tener menos de 100 caracteres.
    const subjectName = name.replace(/\s+/g, ' ').slice(0, 50);
    const snsResult = await sns.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: 'Nueva solicitud - Vertice Rocodromo - ' + subjectName,
      Message: JSON.stringify({ id, name, email, phone, message, timestamp }, null, 2)
    }));

    console.log('Mensaje SNS publicado:', snsResult.MessageId);

    return response(200, {
      success: true,
      message: 'Solicitud guardada y notificada correctamente',
      id
    });
  } catch (error) {
    console.error('Error al procesar:', error);
    return response(500, { success: false, error: 'Error al procesar la solicitud' });
  }
};

function response(statusCode, payload) {
  return { statusCode, headers: corsHeaders(), body: JSON.stringify(payload) };
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };
}
