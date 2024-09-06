const amqp = require('amqplib');
require('dotenv').config();

let channel, connection;
let messages = []; // Array to store messages

const connectRabbitMQ = async () => {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
    throw err;
  }
};

const sendToQueue = async (queue, message) => {
  try {
    if (!channel) {
      throw new Error('Channel not initialized');
    }
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Message sent to queue: ${queue}`);
  } catch (err) {
    console.error('Failed to send message to queue:', err);
    throw err;
  }
};

const consumeFromQueue = async (queue, callback) => {
  try {
    if (!channel) {
      throw new Error('Channel not initialized');
    }
    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const message = msg.content.toString();
        console.log(`Message received from queue: ${queue}`);
        messages.push(message);  // Store the message in the array
        if (typeof callback === 'function') {
          callback(message);  // Ensure the callback is a function before calling it
        } else {
          console.error('Callback is not a function');
        }
        channel.ack(msg);   // Acknowledge the message
      }
    });
  } catch (err) {
    console.error('Failed to consume message from queue:', err);
    throw err;
  }
};

// Function to retrieve messages from the array
const getMessagesFromQueue = () => {
  return messages;
};

process.on('exit', (code) => {
  if (connection) {
    connection.close();
  }
  console.log(`Closing RabbitMQ connection`);
});

module.exports = {
  connectRabbitMQ,
  sendToQueue,
  consumeFromQueue,
  getMessagesFromQueue // Export the function to get messages
};
