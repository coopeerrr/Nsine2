# N-Sine Medical Equipment E-commerce Platform

A professional medical equipment e-commerce website built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Frontend
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Product Catalog**: Advanced filtering, search, and categorization
- **Product Details**: Comprehensive product information with image galleries
- **Contact System**: Professional contact forms with message management
- **Performance Optimized**: Lazy loading, skeleton states, and code splitting
- **SEO Friendly**: Meta tags and structured data

### Admin Panel
- **Secure Authentication**: Role-based access control with Supabase Auth
- **Dashboard Overview**: Real-time statistics and system monitoring
- **Product Management**: Full CRUD operations for products and categories
- **Order Management**: Track and manage customer orders
- **Message Center**: Handle customer inquiries and support requests
- **Analytics**: Business insights and performance metrics

### Technical Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd n-sine-medical-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migration in the Supabase SQL editor
   - Copy your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Database Setup

The database schema is automatically created using the migration file. It includes:

- **Categories**: Product categorization
- **Products**: Complete product information with specifications
- **Orders**: Customer order management
- **Messages**: Customer inquiry system

### Admin Access

To create an admin user:

1. Sign up through Supabase Auth
2. Update the user's metadata in Supabase dashboard:
   ```json
   {
     "role": "admin"
   }
   ```

Demo credentials (for development):
- Email: admin@n-sine.com
- Password: admin123

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin panel components
│   ├── layout/         # Header, Footer, Navigation
│   ├── product/        # Product-related components
│   └── ui/            # Reusable UI components
├── contexts/           # React contexts (Auth)
├── lib/               # Utilities and configurations
├── pages/             # Route components
│   ├── admin/         # Admin pages
│   ├── Home.tsx       # Homepage
│   ├── Products.tsx   # Product catalog
│   ├── ProductDetail.tsx
│   └── Contact.tsx
└── types/             # TypeScript type definitions
```

## Color Palette

- **Primary**: #0066CC (Medical Blue)
- **Secondary**: #00A896 (Mint Green)  
- **Accent**: #E6F3FF (Light Blue)
- **Background**: #FFFFFF
- **Text**: #333333

## Security Features

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Input sanitization and validation
- Protected API routes
- Form validation with Zod schemas

## Performance Optimizations

- **Image Lazy Loading**: Deferred loading for better performance
- **Code Splitting**: Route-based chunks for faster initial load
- **Skeleton Loading**: Smooth loading states
- **Debounced Search**: Optimized search functionality
- **Responsive Images**: Optimized for different screen sizes

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Ensure all environment variables are set in your production environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Future Enhancements

- **Payment Integration**: Stripe/PayPal integration ready
- **Inventory Management**: Advanced stock tracking
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Enhanced reporting dashboard
- **Email Notifications**: Order confirmations and updates
- **User Reviews**: Product rating system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@n-sine.com
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

---

Built with ❤️ for the healthcare industry by N-Sine Medical Equipment