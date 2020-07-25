type Role = 'SUBSCRIBER' | 'MODERATOR' | 'BROADCASTER';

interface Author {
  id: string;
  username: string;
  roles: Role[];
}

interface Command {
  message: string;
  command: string;
  arguments?: string[];
  author: Author;
  extra: { channel: string };
}

declare function Handler(command: Command): Effect;

interface EffectDefinition {
  name: string;
  description?: string;
  handler: Handler;
}

interface Effect {
  message?: string;
  audio?: string;
  image?: string;
  duration?: number;
}

export default function createHandler({
  name,
  description,
  handler,
}: EffectDefinition): function;
