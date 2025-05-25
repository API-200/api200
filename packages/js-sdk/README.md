# API200 SDK Generator

A TypeScript SDK generator that automatically creates a fully-typed client library for your API200 services. Generate type-safe API clients with zero configuration and full IDE support.

## Features

- **Automatic Type Generation**: Creates TypeScript interfaces from your API schemas
- **Full Type Safety**: Compile-time error checking for API calls
- **Zero Configuration**: Works out of the box with sensible defaults
- **Path & Query Parameters**: Handles both path variables and query strings
- **Request Body Support**: Type-safe request body handling for POST/PUT/PATCH
- **Error Handling**: Structured error responses with status codes
- **IDE Support**: Full IntelliSense and autocomplete support

## Prerequisites

1. **Register with API200**: Sign up at [API200](https://api200.co) and set up your API proxy platform
2. **Import/Create Services**: Add your API services to the API200 platform
3. **Get API Token**: Obtain your user token from the API200 dashboard

## Installation

Generate your SDK using npx (no installation required):

```bash
npx api200-generate-sdk -t YOUR_API_TOKEN
```

## Command Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--token` | `-t` | **Required.** Your API200 user token ||
| `--base-url` | `-u` | Base API URL | `https://eu.api200.co/api` |
| `--output` | `-o` | Output directory | `./src/lib/api200` or `./lib/api200` |

### Examples

```bash
# Basic usage
npx api200-generate-sdk -t your_token_here

# Custom output directory
npx api200-generate-sdk -t your_token_here -o ./src/api

# Different API region
npx api200-generate-sdk -t your_token_here -u https://us.api200.co/api
```

## Generated Structure

The SDK generator creates the following file structure:

```
lib/api200/
├── index.ts          # Main export file with configured client
├── api200.ts         # Core client and request handling
├── types.ts          # TypeScript type definitions
└── [service-name].ts # Individual service files
```

## Usage Example

### Usage

```typescript
import api200 from './lib/api200';

// GET request with path parameter
const { data, error } = await api200.users.getUserById.get({ 
  id: "123" 
});

if (error) {
  console.error('API Error:', error.message);
} else {
  console.log('User data:', data);
}
```

### Method Naming Convention

Methods are generated using the pattern: `[httpMethod][EndpointPath]`

Examples:
- `GET /users/{id}` → `getUserById.get()`
- `POST /users` → `createUser.post()`
- `PUT /users/{id}` → `updateUserById.put()`
- `DELETE /orders/{orderId}` → `deleteOrderByOrderId.delete()`

## Error Handling

All API methods return a consistent response structure:

```typescript
interface API200Response<T> {
  data: T | null;
  error: API200Error | null;
}

interface API200Error {
  message: string;
  status?: number;
  details?: any;
}
```

## Types

The generator creates comprehensive TypeScript types for all your APIs:

## Updating Your SDK

When you add new services or modify existing ones in API200:

1. **Regenerate the SDK**:
   ```bash
   npx api200-generate-sdk -t YOUR_API_TOKEN
   ```

2. **The generator will**:
    - Fetch the latest service definitions
    - Update all type definitions
    - Add new service methods
    - Preserve your existing configuration

3. **No breaking changes**: Existing code continues to work while new features become available

## Support

- [GitHub](https://github.com/API-200/api200/discussions)
