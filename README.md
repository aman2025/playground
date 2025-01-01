<p align="center">
  <img alt="Gemini Coder" width="100" height="100" src="./public/images/logo.png">
  <h3 align="center">DW-Playground</h3>
</p>

<p align="center">
  Generate a Vue page with a prompt or design image or sketch. Powered by open source models from Mistral AI.
  Edit and preview responsive code in a sandbox real-time.
</p>

## Tech stack

- [Mistral AI API](https://mistral.ai/api/docs) to use Pixtral Large 124B
- [Sandpack](https://sandpack.codesandbox.io/) for the code sandbox
- Next.js app router with Tailwind、Shadcn/UI、Zustand、NextAuth、PostgresSql、Prisma、ReactMarkdown、ReactSyntaxHighlighter
- [Prisma](https://www.prisma.io/) for database ORM
- [PostgresSql](https://www.postgresql.org/) for database
- [React Query](https://tanstack.com/query) for data fetching and caching
- [React Query Devtools](https://tanstack.com/query/latest/docs/react/plugins/devtools) for debugging
- [Nodemailer](https://nodemailer.com/) for email sending
- [NextAuth](https://next-auth.js.org/) for authentication
- [React Markdown](https://react-markdown.org/) for markdown rendering
- [React Syntax Highlighter](https://react-syntax-highlighter.github.io/) for code highlighting
- [Lucide](https://lucide.dev/) for icons
- [Medium Zoom](https://github.com/francoischalifour/medium-zoom) for image zoom
- [Framer Motion](https://www.framer.com/motion/) for animations

## running

1. Create a `.env` file and add your [Mistral AI API key](https://mistral.ai/api/docs): `MISTRAL_API_KEY=`、 `MISTRAL_API_ENDPOINT=` or `AGENT_ID`
2. Run `npm install` and `npm run dev` to install dependencies and run locally

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
