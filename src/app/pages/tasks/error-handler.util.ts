export function extractErrorMessage(err: any, defaultMessage: string): string {
  if (err && err.error) {
    try {
      const errorObj = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
      if (errorObj && errorObj.message) {
        return errorObj.message;
      }
    } catch (e) {
      // Ignora erro de parse, mantém a mensagem padrão
    }
  }
  return defaultMessage;
}