# Token Feedback Hub

> Your community's voice, amplified and actionable.

Token Feedback Hub is a Farcaster-native application that allows communities to submit, organize, and prioritize feedback directly within their Farcaster client. Built as a Base mini-app, it provides a seamless feedback loop between community members and project teams.

![Token Feedback Hub Screenshot](docs/images/screenshot.png)

## ✨ Features

### 🎯 **Structured Feedback Submission**
- Guided form within Farcaster frames
- Prompts for specific details: problem, solution, and impact
- Ensures all feedback is categorized and actionable

### 🏠 **Centralized Feedback Hub**
- Browsable list of all submitted feedback
- Filter and sort functionality
- View and interact without leaving Farcaster

### 🗳️ **Community Voting & Upvoting**
- Upvote feedback entries you agree with
- Community-driven prioritization
- Real-time upvote counts and rankings

### 🔗 **Farcaster Integration**
- Native frame experience
- Seamless authentication via Farcaster ID
- Optional cast posting for feedback visibility

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Neynar API key (for Farcaster integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/token-feedback-hub.git
   cd token-feedback-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Neynar API Configuration
   VITE_NEYNAR_API_KEY=your_neynar_api_key
   VITE_NEYNAR_BASE_URL=https://api.neynar.com/v2

   # Application Configuration
   VITE_APP_NAME=Token Feedback Hub
   VITE_APP_URL=https://your-app-domain.com
   VITE_FRAME_BASE_URL=https://your-app-domain.com
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
   - Configure Row Level Security policies (included in schema)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Farcaster via Neynar API
- **Deployment**: Docker + Vercel/Netlify

### Project Structure

```
token-feedback-hub/
├── src/
│   ├── components/          # React components
│   │   ├── FeedbackForm.jsx
│   │   ├── FeedbackListItem.jsx
│   │   └── FrameHeader.jsx
│   ├── services/           # API services
│   │   ├── feedbackService.js
│   │   ├── userService.js
│   │   └── frameService.js
│   ├── config/             # Configuration
│   │   └── supabase.js
│   └── App.jsx             # Main application
├── database/               # Database schema
│   └── schema.sql
├── docs/                   # Documentation
│   └── API.md
├── public/                 # Static assets
└── package.json
```

### Data Model

The application uses three main entities:

- **Users**: Farcaster user profiles
- **Feedback**: Community feedback submissions
- **Votes**: Upvote tracking for feedback items

See [Database Schema](database/schema.sql) for complete details.

## 📖 API Documentation

Comprehensive API documentation is available in [docs/API.md](docs/API.md).

### Key Endpoints

- `GET /api/feedback` - List all feedback
- `POST /api/feedback` - Submit new feedback
- `POST /api/feedback/:id/upvote` - Upvote feedback
- `GET /api/frame` - Farcaster frame entry point
- `POST /api/frame/action` - Handle frame interactions

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_NEYNAR_API_KEY` | Neynar API key for Farcaster | Yes |
| `VITE_NEYNAR_BASE_URL` | Neynar API base URL | No |
| `VITE_APP_URL` | Application base URL | Yes |
| `VITE_FRAME_BASE_URL` | Frame base URL | Yes |

### Supabase Setup

1. Create a new Supabase project
2. Copy your project URL and anon key
3. Run the database schema:
   ```sql
   -- Copy and paste contents of database/schema.sql
   ```
4. Enable Row Level Security (RLS) policies are included in the schema

### Neynar API Setup

1. Sign up at [Neynar](https://neynar.com)
2. Create a new API key
3. Add the key to your environment variables
4. (Optional) Set up a signer for posting casts

## 🚀 Deployment

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t token-feedback-hub .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e VITE_SUPABASE_URL=your_url \
     -e VITE_SUPABASE_ANON_KEY=your_key \
     -e VITE_NEYNAR_API_KEY=your_key \
     token-feedback-hub
   ```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard

### Netlify Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   netlify deploy --prod --dir=dist
   ```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Manual Testing

1. **Test Feedback Submission**
   - Navigate to the submit form
   - Fill out all required fields
   - Verify feedback appears in the hub

2. **Test Upvoting**
   - Click upvote buttons on feedback items
   - Verify counts update correctly
   - Test preventing duplicate votes

3. **Test Frame Integration**
   - Use a Farcaster client to test frame interactions
   - Verify button actions work correctly
   - Test frame image generation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- Use ESLint and Prettier for code formatting
- Follow React best practices
- Write meaningful commit messages
- Add JSDoc comments for functions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- 📖 [Documentation](docs/)
- 🐛 [GitHub Issues](https://github.com/your-org/token-feedback-hub/issues)
- 💬 [Discord Community](https://discord.gg/your-server)
- 📧 Email: support@your-domain.com

### Common Issues

**Q: Supabase connection fails**
A: Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct and that RLS policies are properly configured.

**Q: Frame interactions don't work**
A: Ensure your `VITE_NEYNAR_API_KEY` is valid and your frame URLs are publicly accessible.

**Q: Upvotes don't update**
A: Check that the database triggers are properly installed from the schema file.

## 🗺️ Roadmap

### Version 1.1
- [ ] Advanced filtering and sorting
- [ ] Feedback categories and tags
- [ ] Email notifications
- [ ] Admin dashboard

### Version 1.2
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Integration with other platforms
- [ ] Mobile app

### Version 2.0
- [ ] Token-gated features
- [ ] Governance integration
- [ ] Advanced AI categorization
- [ ] Custom branding options

## 🙏 Acknowledgments

- [Farcaster](https://farcaster.xyz/) for the decentralized social protocol
- [Neynar](https://neynar.com/) for Farcaster API services
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Base](https://base.org/) for the L2 platform
- The open-source community for inspiration and tools

---

**Built with ❤️ for the Farcaster community**
