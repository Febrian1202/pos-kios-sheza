export class LoginError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
  }
}
