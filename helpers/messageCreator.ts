//types
import { User, Message } from '../types/types'

const createMessage = (data: Message): Message => {

  const msg: Message = { ...data };

  const author: User = msg.author;

  msg.author = msg.recipient;

  msg.recipient = author;

  return msg;
  
};

export default createMessage;
