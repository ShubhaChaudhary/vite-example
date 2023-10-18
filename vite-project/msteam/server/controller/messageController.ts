import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import {
  ConversationMessageSuccessResponse,
  MessageForConversationData,
  MessageForUsersData,
  UserMessageSuccessResponse
} from '../models/MessageModel';
import MessageService from '../services/MessageService';
import {
  handleExceptions,
  handleValidationErrors
} from '../utils/errorHandlers';

export default class MessageController {
  messageService: MessageService;

  constructor(messageService: MessageService) {
    this.messageService = messageService;
  }

  /* Note: These are temporary endpoints until we use kafka in production */

  async sendMessageToUsers(req, res): Promise<void> {
    try {
      const messageData: MessageForUsersData = plainToClass(
        MessageForUsersData,
        req.body
      );
      const errors: ValidationError[] = await validate(messageData, {
        skipMissingProperties: true
      });
      if (errors.length > 0) {
        return handleValidationErrors(errors, res);
      }

      const result = await this.messageService.sendMessageToUsers(
        messageData.tenantId,
        messageData.userIds,
        messageData.serviceUrl,
        messageData.card
      );
      return res.status(200).json(new UserMessageSuccessResponse(result));
    } catch (exception) {
      return handleExceptions(exception, res);
    }
  }

  async sendMessageToConversation(req, res): Promise<void> {
    try {
      const messageData: MessageForConversationData = plainToClass(
        MessageForConversationData,
        req.body
      );
      const errors: ValidationError[] = await validate(messageData, {
        skipMissingProperties: true
      });
      if (errors.length > 0) {
        return handleValidationErrors(errors, res);
      }

      await this.messageService.sendMessageToConversation(
        messageData.conversationId,
        messageData.serviceUrl,
        messageData.card
      );
      return res.status(200).json(new ConversationMessageSuccessResponse());
    } catch (exception) {
      return handleExceptions(exception, res);
    }
  }
}