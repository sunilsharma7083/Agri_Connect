# Kisaan - Digital Grain Marketplace 🌾

A comprehensive MERN stack web application that connects farmers with buyers for quality grains. Built with modern technologies and best practices.

## 🚀 Features

### For Farmers
- **Digital Grain Listings**: List grains with detailed specifications
- **Price Management**: Set competitive prices per quintal
- **Order Management**: Track and manage received orders
- **Dashboard Analytics**: View sales statistics and performance

### For Buyers
- **Browse Grains**: Search and filter quality grains
- **Direct Orders**: Place orders directly with farmers
- **Order Tracking**: Monitor order status and delivery
- **Secure Payments**: Safe payment processing

### For Admins
- **User Management**: Manage farmers and buyers
- **Content Moderation**: Approve/reject grain listings
- **Analytics Dashboard**: Comprehensive platform analytics
- **System Configuration**: Manage platform settings

### Core Features
- **Multilingual Support**: English and Hindi language support
- **Responsive Design**: Works on all devices
- **JWT Authentication**: Secure user authentication
- **Role-based Access**: Different access levels for farmers, buyers, and admins
- **File Uploads**: Image uploads for grain listings
- **Email Notifications**: Automated email notifications
- **Search & Filters**: Advanced search and filtering capabilities

## �️ Technology Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Query** - Data fetching and caching
- **i18next** - Internationalization
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Heroicons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **Express Validator** - Input validation
- **Helmet** - Security middleware

## � Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone https://github.com/chiragjain/kisaan.git
cd kisaan

# Install all dependencies
npm install
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration

# Start the development servers
npm run dev
```

This will start:
- Backend server at http://localhost:5000
- Frontend app at http://localhost:3000

### Environment Configuration

Create `server/.env` with:
```env
MONGODB_URI=mongodb://localhost:27017/kisaan
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 🚀 Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only  
npm run build        # Build for production
npm run seed         # Seed database with sample data
```

## 📂 Project Structure

```
kisaan/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts  
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── middleware/       # Express middleware
└── uploads/              # File upload directory
```

## 🔐 Authentication

The app uses JWT authentication with three roles:
- **Farmer**: Create listings, manage orders
- **Buyer**: Browse grains, place orders
- **Admin**: Platform management

## 🌐 Multilingual Support

Supports English and Hindi with complete UI translation.

## 📱 Key Features Implemented

✅ **Backend Architecture**
- Complete REST API with Express.js
- MongoDB integration with Mongoose
- JWT authentication & authorization
- File upload handling with Multer
- Email notification system
- Input validation & error handling

✅ **Frontend Foundation** 
- React.js with modern hooks
- Responsive design with Tailwind CSS
- Multi-language support (i18n)
- State management with Context API
- Routing with React Router
- Component architecture

✅ **User Interface**
- Modern, responsive design
- Smooth animations with Framer Motion
- Comprehensive navigation system
- Role-based dashboard layouts
- Form validation & error handling

## 🔄 Current Status

The application foundation is complete with:
- ✅ Full backend API implementation
- ✅ Database models and relationships
- ✅ Authentication system
- ✅ Frontend project structure
- ✅ UI components and layouts
- ✅ Home page with modern design
- ✅ Dashboard frameworks
- ⏳ Individual page implementations (in progress)

## 🤝 Contributing

This is a complete MERN stack application showcasing modern web development practices. Feel free to explore the codebase and extend functionality.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with modern MERN stack technologies for the farming community** 🌾

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Environment Variables

Create `.env` file in the server directory:
```
MONGODB_URI=mongodb://localhost:27017/kisaan
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
NODE_ENV=development
PORT=5000
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Grains
- `GET /api/grains` - Get all grains
- `POST /api/grains` - Create grain listing
- `PUT /api/grains/:id` - Update grain listing
- `DELETE /api/grains/:id` - Delete grain listing

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user orders
- `PUT /api/orders/:id` - Update order status

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/grains/:id/approve` - Approve grain listing
- `GET /api/admin/analytics` - Get analytics data

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect GitHub repository
4. Deploy

### Vercel Deployment (Frontend)
1. Connect GitHub repository to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/build`

## 👥 User Roles

### Farmer
- Register and manage profile
- List grains for sale
- View and manage orders
- Upload grain images

### Buyer
- Browse grain listings
- Filter by type, price, location
- Place orders
- View order history

### Admin
- Approve/reject grain listings
- Manage users
- View analytics and reports

## 🎨 Design Features

- Clean, modern interface
- Earthy color scheme (greens, browns)
- Mobile-responsive design
- Accessibility-compliant (WCAG guidelines)
- Multilingual support (English/Hindi)

## 📱 Mobile Features

- Touch-friendly interface
- Optimized for small screens
- Fast loading times
- Offline capability (PWA ready)

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection

## 📊 Analytics

- Total sales tracking
- Active listings count
- User engagement metrics
- Regional sales data

## 🌍 Multilingual Support

Supports English and Hindi with easy switching between languages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@kisaan.com or create an issue in this repository.
# kisanApp
# Agri_Connect
