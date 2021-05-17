const createMessage = (data: any): any => {
  const msg = { ...data };

  const author = msg.author;

  msg.author = msg.recipient;

  msg.recipient = author;

  return msg;
};

export default createMessage;
