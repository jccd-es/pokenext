# PokeNext

A modern Pokémon explorer built with Next.js 16 and TypeScript, consuming the PokéAPI to display comprehensive Pokémon information with real-time filtering and search capabilities.

## 🎯 Project Objectives

This project was developed as a technical assessment with the following requirements:

1. **Pokémon Listing**: Display all Pokémon sorted by ID, showing name, generation, and types
2. **Advanced Filtering**: Filter by type and generation using dropdown selectors
3. **Real-time Search**: Search Pokémon by name with live results, including evolution chains
4. **Detailed View**: Individual Pokémon pages displaying:
   - Name and image
   - Generation and types
   - Evolution chain with images
   - Base stats
   - Navigation between evolutions while maintaining context

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **API**: [PokéAPI](https://pokeapi.co/)
- **Package Manager**: npm

## 📋 Features

- ✅ Complete Pokémon listing with sorting by ID
- ✅ Filter by type and generation
- ✅ Real-time search with evolution chain support
- ✅ AI-powered semantic search (optional, requires OpenAI API key)
- ✅ Detailed Pokémon information pages
- ✅ Evolution chain visualization with navigation
- ✅ State persistence when navigating back to listing
- ✅ Responsive design for all screen sizes
- ✅ Dark mode support
- ✅ Loading states with skeleton components

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pokenext
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (optional):

```bash
cp .env.example .env
```

Edit the `.env` file and add your OpenAI API key to enable AI-powered search:

```
OPENAI_API_KEY=your_openai_api_key_here
```

> **Note**: The AI search feature is optional. If no API key is provided, the application will use standard text-based search functionality.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
pokenext/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main listing page
│   ├── pokemon/[id]/        # Dynamic Pokémon detail pages
│   ├── layout.tsx           # Root layout with metadata
│   └── globals.css          # Global styles
├── components/
│   └── ui/                  # Reusable UI components (shadcn/ui)
├── lib/
│   └── utils.ts             # Utility functions
├── .cursor/rules/           # AI-assisted development rules
└── public/                  # Static assets
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Integration

The application integrates with [PokéAPI v2](https://pokeapi.co/docs/v2) to fetch:
- Pokémon list and details
- Evolution chains
- Generation data
- Type information
- Base stats

### AI-Powered Search (Optional)

The application includes an optional AI-powered semantic search feature that uses OpenAI's GPT models to provide intelligent Pokémon search capabilities:

- **Natural Language Queries**: Search using descriptive phrases like "fire type starters" or "dragon legendary"
- **Semantic Understanding**: The AI interprets your intent beyond exact name matches
- **Smart Filtering**: Automatically applies relevant filters based on your query

**To enable AI search:**

1. Obtain an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Restart the development server

**Without an API key**, the search will fall back to standard text-based filtering by Pokémon name.

## 📝 Implementation Notes

- **Server Components**: Leverages Next.js 16 Server Components for optimal performance
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Component Library**: Uses shadcn/ui for consistent, accessible UI components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: URL-based state for filters to maintain navigation context

## 🤖 AI-Assisted Development

This project was developed with the assistance of AI tools to enhance productivity and code quality:

- **[Cursor](https://cursor.com/)**: AI-powered IDE used as the primary development environment
- **Cursor Rules**: Project-specific rules configured in `.cursor/rules/` to maintain consistent conventions, coding standards, and architectural decisions across AI-assisted development sessions

## 🔜 Future Enhancements

Potential improvements for future iterations:
- Add pagination or infinite scroll for better performance
- Implement caching strategies for API responses
- Add ability comparisons and weaknesses
- Include move sets and learnable moves
- Add animations and transitions
- Implement favorites/bookmarks feature

## 👤 Author

**Jose Carlos** — [GitHub](https://github.com/jccd-es)

## 📄 License

This project is for educational and assessment purposes.