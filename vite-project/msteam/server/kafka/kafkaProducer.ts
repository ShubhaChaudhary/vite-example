import { CompressionTypes, Kafka, logLevel, Producer } from 'kafkajs';
import { LogContext, logger } from '../lib/logger';
import { kafkaSentCounter } from '../instrumentation';
import { MeetingEvent } from './models/dubber_meeting_event';
import { isDevelopment } from '../../common/lib/constants';

export default class KafkaProducer {
  private static instance: KafkaProducer;
  private _producer: Producer;
  private _isConnected = false;

  public constructor() {
    this._producer = this.createKafkaProducer();
  }

  public static getInstance(): KafkaProducer {
    if (!KafkaProducer.instance) {
      KafkaProducer.instance = new KafkaProducer();
    }
    return KafkaProducer.instance;
  }

  public async publishToKafka(
    key: string,
    value: MeetingEvent,
    logContext?: LogContext
  ) {
    try {
      logger.info(
        { context: logContext, payload: { key, value } },
        'Publishing to kafka'
      );

      const serializedMessage = MeetingEvent.encode(value).finish();

      await this.sendMessage(
        process.env.GLOBAL_KAFKA_MEETINGS_TOPIC!,
        key,
        Buffer.from(serializedMessage)
      );
    } catch (error) {
      logger.error(
        error,
        `Kafka Producer Error on topic=${process.env.GLOBAL_KAFKA_MEETINGS_TOPIC} and brokers=${process.env.GLOBAL_KAFKA_BROKERS}`
      );

      throw error;
    }
  }

  private async connect(): Promise<void> {
    try {
      await this._producer.connect();
      this._isConnected = true;
    } catch (err) {
      logger.error(err);
    }
  }

  private async sendMessage(
    topic: string,
    key: string,
    value: Buffer
  ): Promise<void> {
    if (!this._isConnected) {
      await this.connect();
    }
    this._producer
      .send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: [{ key, value }]
      })
      .then(() => {
        kafkaSentCounter.inc(1);
      });
  }

  public async shutdown(): Promise<void> {
    await this._producer.disconnect();
  }

  private createKafkaProducer(): Producer {
    const kafka = new Kafka({
      logLevel: logLevel.INFO,
      clientId: process.env.APPLICATION_NAME,
      brokers: process.env.GLOBAL_KAFKA_BROKERS!.split(','),
      ssl: !isDevelopment,
      sasl: isDevelopment
        ? undefined
        : {
            mechanism: 'scram-sha-512',
            username: process.env.GLOBAL_KAFKA_USERNAME!,
            password: process.env.GLOBAL_KAFKA_PASSWORD!
          }
    });
    const producer = kafka.producer();
    return producer;
  }
}
