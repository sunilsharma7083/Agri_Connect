const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Grain = require('../models/Grain');
const Order = require('../models/Order');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisaan');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Grain.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@kisaan.com',
      password: 'admin123', // Plain password - will be hashed by pre-save hook
      phone: '9876543210',
      role: 'admin',
      address: {
        street: 'Admin Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001'
      },
      isVerified: true,
      isActive: true
    });
    console.log('Created admin user');

    // Create sample farmers
    const farmers = [
      {
        name: 'Ramesh Kumar',
        email: 'ramesh@example.com',
        password: 'password123', // Plain password - will be hashed by pre-save hook
        phone: '9876543211',
        role: 'farmer',
        address: {
          street: 'Village Khera',
          city: 'Kurukshetra',
          state: 'Haryana',
          pincode: '136119'
        },
        isVerified: true,
        isActive: true
      },
      {
        name: 'Suresh Singh',
        email: 'suresh@example.com',
        password: 'password123', // Plain password - will be hashed by pre-save hook
        phone: '9876543212',
        role: 'farmer',
        address: {
          street: 'Village Kaithal',
          city: 'Kaithal',
          state: 'Haryana',
          pincode: '136027'
        },
        isVerified: true,
        isActive: true
      },
      {
        name: 'Mukesh Sharma',
        email: 'mukesh@example.com',
        password: 'password123', // Plain password - will be hashed by pre-save hook
        phone: '9876543213',
        role: 'farmer',
        address: {
          street: 'Village Karnal',
          city: 'Karnal',
          state: 'Haryana',
          pincode: '132001'
        },
        isVerified: true,
        isActive: true
      }
    ];

    const createdFarmers = await User.create(farmers);
    console.log('Created farmers');

    // Create sample buyers
    const buyers = [
      {
        name: 'Rajesh Gupta',
        email: 'rajesh@example.com',
        password: 'password123', // Plain password - will be hashed by pre-save hook
        phone: '9876543214',
        role: 'buyer',
        address: {
          street: 'Sector 14',
          city: 'Gurgaon',
          state: 'Haryana',
          pincode: '122001'
        },
        isVerified: true,
        isActive: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'password123', // Plain password - will be hashed by pre-save hook
        phone: '9876543215',
        role: 'buyer',
        address: {
          street: 'Model Town',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110009'
        },
        isVerified: true,
        isActive: true
      }
    ];

    const createdBuyers = await User.create(buyers);
    console.log('Created buyers');

    // Create sample grains
    const grains = [
      {
        farmer: createdFarmers[0]._id,
        title: 'Premium Basmati Rice - Pusa 1121',
        grainType: 'rice',
        variety: 'Pusa 1121',
        quantity: 50,
        availableQuantity: 50,
        pricePerQuintal: 4500,
        description: 'Premium quality Basmati rice with long grains and excellent aroma. Grown organically without harmful pesticides. Perfect for biryanis and special occasions.',
        location: {
          address: 'Village Khera, Kurukshetra',
          city: 'Kurukshetra',
          state: 'Haryana',
          pincode: '136119'
        },
        qualityGrade: 'A',
        harvestDate: new Date('2024-11-15'),
        status: 'approved',
        isOrganic: true,
        minimumOrderQuantity: 2,
        tags: ['basmati', 'premium', 'organic'],
        approvedBy: admin._id,
        approvedAt: new Date()
      },
      {
        farmer: createdFarmers[0]._id,
        title: 'Golden Wheat - HD 2967',
        grainType: 'wheat',
        variety: 'HD 2967',
        quantity: 100,
        availableQuantity: 100,
        pricePerQuintal: 2200,
        description: 'High-quality wheat suitable for making chapatis and bread. Rich in protein and fiber. Grown using sustainable farming practices.',
        location: {
          address: 'Village Khera, Kurukshetra',
          city: 'Kurukshetra',
          state: 'Haryana',
          pincode: '136119'
        },
        qualityGrade: 'A',
        harvestDate: new Date('2024-10-20'),
        status: 'approved',
        isOrganic: false,
        minimumOrderQuantity: 5,
        tags: ['wheat', 'protein-rich', 'sustainable'],
        approvedBy: admin._id,
        approvedAt: new Date()
      },
      {
        farmer: createdFarmers[1]._id,
        title: 'Yellow Corn - High Yield Variety',
        grainType: 'corn',
        variety: 'Hybrid 4640',
        quantity: 75,
        availableQuantity: 75,
        pricePerQuintal: 1800,
        description: 'Fresh yellow corn with high nutritional value. Suitable for animal feed and food processing. Good moisture content and storage quality.',
        location: {
          address: 'Village Kaithal',
          city: 'Kaithal',
          state: 'Haryana',
          pincode: '136027'
        },
        qualityGrade: 'B',
        harvestDate: new Date('2024-12-01'),
        status: 'approved',
        isOrganic: false,
        minimumOrderQuantity: 10,
        tags: ['corn', 'animal-feed', 'high-yield'],
        approvedBy: admin._id,
        approvedAt: new Date()
      },
      {
        farmer: createdFarmers[1]._id,
        title: 'Organic Pearl Millet (Bajra)',
        grainType: 'millet',
        variety: 'HHB 67',
        quantity: 30,
        availableQuantity: 30,
        pricePerQuintal: 3200,
        description: 'Organic pearl millet grown without chemical fertilizers. Rich in iron, protein, and fiber. Perfect for healthy diet and traditional recipes.',
        location: {
          address: 'Village Kaithal',
          city: 'Kaithal',
          state: 'Haryana',
          pincode: '136027'
        },
        qualityGrade: 'A',
        harvestDate: new Date('2024-11-25'),
        status: 'approved',
        isOrganic: true,
        minimumOrderQuantity: 1,
        tags: ['millet', 'organic', 'healthy', 'iron-rich'],
        approvedBy: admin._id,
        approvedAt: new Date()
      },
      {
        farmer: createdFarmers[2]._id,
        title: 'Six Row Barley - Premium Quality',
        grainType: 'barley',
        variety: 'BH 393',
        quantity: 40,
        availableQuantity: 40,
        pricePerQuintal: 2500,
        description: 'Premium six-row barley suitable for malting and animal feed. Good protein content and excellent brewing qualities.',
        location: {
          address: 'Village Karnal',
          city: 'Karnal',
          state: 'Haryana',
          pincode: '132001'
        },
        qualityGrade: 'A',
        harvestDate: new Date('2024-11-10'),
        status: 'pending',
        isOrganic: false,
        minimumOrderQuantity: 5,
        tags: ['barley', 'malting', 'brewing']
      },
      {
        farmer: createdFarmers[2]._id,
        title: 'White Sorghum (Jowar) - Organic',
        grainType: 'sorghum',
        variety: 'CSV 15',
        quantity: 25,
        availableQuantity: 25,
        pricePerQuintal: 2800,
        description: 'Organic white sorghum rich in antioxidants and gluten-free. Perfect for health-conscious consumers and traditional recipes.',
        location: {
          address: 'Village Karnal',
          city: 'Karnal',
          state: 'Haryana',
          pincode: '132001'
        },
        qualityGrade: 'A',
        harvestDate: new Date('2024-12-05'),
        status: 'approved',
        isOrganic: true,
        minimumOrderQuantity: 2,
        tags: ['sorghum', 'organic', 'gluten-free', 'antioxidants'],
        approvedBy: admin._id,
        approvedAt: new Date()
      }
    ];

    const createdGrains = await Grain.create(grains);
    console.log('Created grains');

    // Create sample orders
    const orders = [
      {
        buyer: createdBuyers[0]._id,
        grain: createdGrains[0]._id,
        farmer: createdFarmers[0]._id,
        quantity: 5,
        pricePerQuintal: 4500,
        totalAmount: 22500,
        status: 'delivered',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        deliveryAddress: {
          name: 'Rajesh Gupta',
          phone: '9876543214',
          street: 'Sector 14',
          city: 'Gurgaon',
          state: 'Haryana',
          pincode: '122001'
        },
        deliveryType: 'farmer_delivery',
        estimatedDeliveryDate: new Date('2024-12-20'),
        actualDeliveryDate: new Date('2024-12-18'),
        timeline: [
          {
            status: 'pending',
            timestamp: new Date('2024-12-10'),
            description: 'Order placed'
          },
          {
            status: 'confirmed',
            timestamp: new Date('2024-12-10'),
            description: 'Order confirmed by farmer'
          },
          {
            status: 'paid',
            timestamp: new Date('2024-12-11'),
            description: 'Payment received'
          },
          {
            status: 'shipped',
            timestamp: new Date('2024-12-15'),
            description: 'Order shipped'
          },
          {
            status: 'delivered',
            timestamp: new Date('2024-12-18'),
            description: 'Order delivered successfully'
          }
        ],
        rating: {
          buyerRating: {
            stars: 5,
            review: 'Excellent quality rice, very satisfied!',
            date: new Date('2024-12-19')
          }
        }
      },
      {
        buyer: createdBuyers[1]._id,
        grain: createdGrains[1]._id,
        farmer: createdFarmers[0]._id,
        quantity: 10,
        pricePerQuintal: 2200,
        totalAmount: 22000,
        status: 'confirmed',
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        deliveryAddress: {
          name: 'Priya Sharma',
          phone: '9876543215',
          street: 'Model Town',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110009'
        },
        deliveryType: 'farmer_delivery',
        estimatedDeliveryDate: new Date('2024-12-25'),
        timeline: [
          {
            status: 'pending',
            timestamp: new Date('2024-12-15'),
            description: 'Order placed'
          },
          {
            status: 'confirmed',
            timestamp: new Date('2024-12-16'),
            description: 'Order confirmed by farmer'
          }
        ]
      }
    ];

    await Order.create(orders);
    console.log('Created orders');

    // Update grain quantities after orders
    await Grain.findByIdAndUpdate(createdGrains[0]._id, { 
      $inc: { availableQuantity: -5 } 
    });
    await Grain.findByIdAndUpdate(createdGrains[1]._id, { 
      $inc: { availableQuantity: -10 } 
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Test User Credentials:');
    console.log('Admin: admin@kisaan.com / admin123');
    console.log('Farmer 1: ramesh@example.com / password123');
    console.log('Farmer 2: suresh@example.com / password123');
    console.log('Farmer 3: mukesh@example.com / password123');
    console.log('Buyer 1: rajesh@example.com / password123');
    console.log('Buyer 2: priya@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  require('dotenv').config();
  seedDatabase();
}

module.exports = seedDatabase;
