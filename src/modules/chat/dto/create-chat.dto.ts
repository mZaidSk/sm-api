export class CreateChatDto {
  chatType: 'DIRECT' | 'GROUP'; // Type of chat
  participants: string[]; // Array of user IDs
  chatName?: string; // Optional for group chats
  description?: string; // Optional for group chats
  groupPictureUrl?: string; // Optional for group chats
  createdBy: string; // User ID of the creator
}
