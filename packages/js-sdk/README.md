# API200 SDK Generator

[![npm version](https://badge.fury.io/js/api200-sdk-generator.svg)](https://badge.fury.io/js/api200-sdk-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful CLI tool that automatically generates a TypeScript SDK for your [API 200](https://api200.co) services. Transform your API endpoints into a fully-typed, easy-to-use SDK with a single command.

## 🚀 Features

- **🔧 Zero Configuration** - Just provide your API token and go
- **📝 Full TypeScript Support** - Complete type safety with IntelliSense
- **🎯 Intuitive API** - Clean, predictable method naming
- **⚡ Fast Generation** - Generates SDK in seconds
- **🔄 Automatic Updates** - Re-run to sync with API changes
- **📦 No Dependencies** - Generated code has zero runtime dependencies

## 📥 Installation

### Global Installation
```bash
npm install -g api200-sdk-generator
```

### One-time Usage (Recommended)
```bash
npx api200-generate-sdk -t your_api_token
```

## 🛠️ Usage

### Basic Usage
```bash
npx api200-generate-sdk --token YOUR_API_TOKEN
```

### Custom Output Directory
```bash
npx api200-generate-sdk -t YOUR_API_TOKEN -o ./src/api
```

### Custom Base URL
```bash
npx api200-generate-sdk -t YOUR_API_TOKEN -u https://custom.api200.co/api
```

### All Options
```bash
api200-generate-sdk [options]

Options:
  -t, --token <token>     API200 user token (required)
  -u, --base-url <url>    Base API URL (default: "https://eu.api200.co/api")
  -o, --output <path>     Output directory (default: "./lib/api200")
  -h, --help              Display help for command
```

## 📁 Generated Structure

The generator creates a clean, organized SDK structure:

```
lib/api200/
├── index.ts          # Main SDK export
├── types.ts          # TypeScript interfaces
├── users.ts          # Users service methods
├── orders.ts         # Orders service methods
└── payments.ts       # Payments service methods
```

## 💻 Usage Examples

### Basic Import and Usage
```typescript
import { api200 } from './lib/api200';

// GET request with path parameter
const user = await api200.users.getUserById.get({ id: "123" });
console.log(user.data);

// GET request with query parameters
const users = await api200.users.getUsers.get({ 
  page: 1, 
  limit: 10,
  status: "active" 
});

// POST request with body
const newUser = await api200.users.createUser.post({
  requestBody: {
    name: "John Doe",
    email: "john@example.com"
  }
});
```

### Error Handling
```typescript
import { api200 } from './lib/api200';
import type { ApiError } from './lib/api200/types';

try {
  const result = await api200.users.getUserById.get({ id: "123" });
  console.log('Success:', result.data);
} catch (error) {
  const apiError = error as ApiError;
  console.error('Error:', apiError.message);
  console.error('Status:', apiError.status);
}
```

### Type Safety
```typescript
import { api200 } from './lib/api200';
import type { GetUsersByIdParams, PostUsersParams } from './lib/api200/types';

// Fully typed parameters
const params: GetUsersByIdParams = { id: "123" };
const user = await api200.users.getUserById.get(params);

// TypeScript will catch type errors
const createParams: PostUsersParams = {
  requestBody: {
    name: "John",
    email: "john@example.com",
    // age: "30" // ❌ TypeScript error if age should be number
    age: 30 // ✅ Correct type
  }
};
```

## 🔄 Updating Your SDK

When your API changes, simply re-run the generator to update your SDK:

```bash
npx api200-generate-sdk -t YOUR_API_TOKEN
```

This will overwrite the existing SDK files with the latest API definitions.

## 🌟 Method Naming Convention

The generator creates clean, predictable method names:

| API Endpoint | Generated Method |
|--------------|------------------|
| `GET /users` | `api200.users.getUsers.get()` |
| `GET /users/{id}` | `api200.users.getUsersById.get()` |
| `POST /users` | `api200.users.postUsers.post()` |
| `PUT /users/{id}` | `api200.users.putUsersById.put()` |
| `DELETE /users/{id}` | `api200.users.deleteUsersById.delete()` |

## 🔧 Configuration

### Environment Variables
You can also use environment variables instead of command-line options:

```bash
export API200_TOKEN=your_token_here
export API200_BASE_URL=https://eu.api200.co/api
export API200_OUTPUT=./lib/api200

npx api200-generate-sdk
```

### Project Integration
Add generation to your package.json scripts:

```json
{
  "scripts": {
    "generate-sdk": "api200-generate-sdk -t $API200_TOKEN",
    "build": "npm run generate-sdk && tsc",
    "dev": "npm run generate-sdk && npm run build -- --watch"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**"Failed to fetch services" Error**
- Verify your API token is correct
- Check if the base URL is accessible
- Ensure you have internet connectivity

**TypeScript Compilation Errors**
- Make sure you have TypeScript installed: `npm install -D typescript`
- Check that your tsconfig.json includes the generated files

**Permission Errors**
- Ensure you have write permissions to the output directory
- Try running with elevated permissions if needed

### Getting Help
- Check the [API 200](https://api200.co) documentation
- Open an issue on GitHub
- Contact support through the API 200 website

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **[API 200 Website](https://api200.co)** - Main service website
- **[API Documentation](https://api200.co/docs)** - Full API documentation
- **[GitHub Repository](https://github.com/your-org/api200-sdk-generator)** - Source code and issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Made with ❤️ for [API 200](https://api200.co) developers**
