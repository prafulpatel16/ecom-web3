const amqp = require('amqplib');
require('dotenv').config(); // Ensure .env variables are loaded

let channel = null;

async function connectRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    const connection = await amqp.connect(rabbitmqUrl, {
      credentials: amqp.credentials.plain(
        process.env.RABBITMQ_USER || 'guest',
        process.env.RABBITMQ_PASSWORD || 'guest'
      )
    });
    channel = await connection.createChannel();
    await channel.assertQueue('product_queue');
    console.log('Connected to RabbitMQ and queue created');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
  }
}

async function sendToQueue(message) {
  if (channel) {
    channel.sendToQueue('product_queue', Buffer.from(message));
    console.log('Message sent to queue:', message);
  } else {
    console.error('RabbitMQ channel is not available');
  }
}

async function consumeFromQueue(callback) {
  if (channel) {
    channel.consume('product_queue', (msg) => {
      if (msg !== null) {
        console.log('Message received from queue:', msg.content.toString());
        callback(msg.content.toString());
        channel.ack(msg);
      }
    });
  } else {
    console.error('RabbitMQ channel is not available');
  }
}

module.exports = { connectRabbitMQ, sendToQueue, consumeFromQueue };
