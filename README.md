# WrapMail

## API Requirements

- **`X-API-Key` Header**:  
  All requests must include the `X-API-Key` header. This is mandatory and can be configured in the `.env` file.

- **Routes**:  
  - **POST `/api/auth/login`**:  
    This route generates encrypted data that must be included in the `User-Data` header for all subsequent requests.