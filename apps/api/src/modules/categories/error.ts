export class CategoryNotFoundError extends Error {
  constructor(m: string) {
    super(m)
  }
}
