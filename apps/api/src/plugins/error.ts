export class AuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Access denied, only 'admin' allowed!") {
    super(message);
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class RegisterError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
  }
}
