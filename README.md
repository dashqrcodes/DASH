# Next.js Authentication App

This project is a simple authentication application built with Next.js. It includes sign-in and sign-up functionality, allowing users to enter their phone numbers and other credentials.

## Project Structure

```
nextjs-auth-app
├── src
│   ├── pages
│   │   ├── index.tsx        # Home page with links to sign-in and sign-up
│   │   ├── sign-in.tsx      # Sign-in page with SignInForm component
│   │   └── sign-up.tsx      # Sign-up page with SignUpForm component
│   ├── components
│   │   ├── SignInForm.tsx    # Component for sign-in form
│   │   └── SignUpForm.tsx    # Component for sign-up form
│   └── types
│       └── index.ts          # TypeScript interfaces for user data
├── public                    # Public assets
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Project documentation
```

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd nextjs-auth-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and go to `http://localhost:3000` to view the application.

## Features

- User sign-in and sign-up functionality
- Phone number input for user credentials
- Responsive design

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. 

## License

This project is licensed under the MIT License.