import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const categories = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Beauty',
  'Automotive',
  'Office Supplies',
];

const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'James', 'Anna', 'Robert', 'Maria'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

const productTitles = [
  'Wireless Bluetooth Headphones',
  'Smart Watch Series 5',
  'Laptop Stand Adjustable',
  'USB-C Hub 7-in-1',
  'Mechanical Keyboard RGB',
  'Gaming Mouse Pro',
  'Portable Power Bank 20000mAh',
  'Wireless Charging Pad',
  '4K Webcam HD',
  'Noise Cancelling Earbuds',
  'Smart Home Speaker',
  'Fitness Tracker Band',
  'External SSD 1TB',
  'Monitor Light Bar',
  'LED Desk Lamp',
  'Phone Tripod Mount',
  'Tablet Stand Holder',
  'Webcam Cover Slider',
  'Laptop Cooling Pad',
  'Bluetooth Speaker Mini',
];

const requestTitles = [
  'Looking for bulk electronics',
  'Need office furniture supplier',
  'Searching for fashion wholesaler',
  'Looking for automotive parts',
  'Need sports equipment supplier',
  'Looking for beauty products',
  'Need kitchen appliances',
  'Searching for printing services',
  'Looking for packaging materials',
  'Need wholesale food supplies',
];

async function seed() {
  console.log('🌱 Starting database seed...\n');

  const users: any[] = [];

  console.log('Creating users and profiles...');
  
  for (let i = 0; i < 10; i++) {
    const email = `user${i + 1}@example.com`;
    
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const existing = existingUser.users.find((u: any) => u.email === email);
    
    if (existing) {
      users.push(existing);
      console.log(`  User ${email} already exists`);
      continue;
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        first_name: firstNames[i],
        last_name: lastNames[i],
      },
    });

    if (authError) {
      console.log(`  Error creating ${email}:`, authError.message);
      continue;
    }

    if (authData.user) {
      users.push(authData.user);
      
      const userType = i < 3 ? 'buyer' : i < 6 ? 'seller' : 'both';
      
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        user_type: userType,
        first_name: firstNames[i],
        last_name: lastNames[i],
        bio: `${firstNames[i]} is a ${userType} on RevCom`,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        total_reviews: Math.floor(Math.random() * 50),
      });

      console.log(`  Created ${email} (${userType})`);
    }
  }

  console.log(`\n✓ Created ${users.length} users\n`);

  // Get profiles for later use
  const { data: profiles } = await supabase.from('profiles').select('id, user_type');
  console.log('Found profiles:', profiles?.length);

  console.log('Creating products...');
  // All profiles can be sellers since they all have 'both' type
  const sellerProfiles = profiles || [];
  let productCount = 0;

  if (sellerProfiles.length === 0) {
    console.log('  No seller profiles found, skipping products');
  } else {
    for (let i = 0; i < productTitles.length; i++) {
      const sellerProfile = sellerProfiles[i % sellerProfiles.length];
      if (!sellerProfile) continue;
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const price = Math.floor(Math.random() * 50000) + 500;

      const imageId = 100 + i;
      const { error } = await supabase.from('listings').insert({
        seller_id: sellerProfile.id,
        title: productTitles[i],
        description: `High quality ${productTitles[i].toLowerCase()}. Perfect for professional and personal use.`,
        category,
        price,
        status: 'active',
        inventory_quantity: Math.floor(Math.random() * 100) + 1,
        views: Math.floor(Math.random() * 500),
        image_url: `https://picsum.photos/id/${imageId}/400/400`,
      });

      if (error) {
        console.log('  Product error:', error.message);
      } else {
        productCount++;
      }
    }
  }

  console.log(`✓ Created ${productCount} products\n`);

  console.log('Creating requests...');
  const buyers = [...users.slice(0, 3), ...users.slice(6)];

  for (let i = 0; i < requestTitles.length; i++) {
    if (buyers.length === 0) break;
    
    const buyer = buyers[i % buyers.length];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const budgetMin = Math.floor(Math.random() * 10000) + 1000;
    const budgetMax = budgetMin + Math.floor(Math.random() * 50000);

    await supabase.from('requests').insert({
      buyer_id: buyer.id,
      title: requestTitles[i],
      description: `Looking for reliable suppliers for ${category.toLowerCase()}. Need competitive prices and bulk quantities.`,
      category,
      budget_min: budgetMin,
      budget_max: budgetMax,
      status: i < 7 ? 'open' : 'closed',
    });
  }

  console.log(`✓ Created ${requestTitles.length} requests\n`);

  console.log('Creating sample orders...');
  
  const { data: existingRequests } = await supabase.from('requests').select('id, buyer_id').limit(5);
  const { data: existingProducts } = await supabase.from('listings').select('id, seller_id, title, price').limit(5);

  if (existingRequests && existingProducts && existingProducts.length > 0) {
    const buyerProfiles = profiles?.filter(p => p.user_type === 'buyer' || p.user_type === 'both') || [];
    
    for (let i = 0; i < Math.min(5, existingRequests.length); i++) {
      const request = existingRequests[i];
      const product = existingProducts[i];
      const buyer = buyerProfiles[i % buyerProfiles.length];
      
      if (!buyer) continue;

      await supabase.from('orders').insert({
        buyer_id: buyer.id,
        seller_id: product.seller_id,
        request_id: request.id,
        title: product.title,
        description: `Order for ${product.title}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        agreed_price: product.price,
        delivery_location: 'Addis Ababa, Ethiopia',
        status: i < 3 ? 'pending' : 'delivered',
      });
    }
    console.log(`✓ Created 5 orders\n`);
  }

  console.log('Creating sample conversation...');

  const buyerProfiles = profiles?.filter(p => p.user_type === 'buyer' || p.user_type === 'both') || [];
  const sellerProfilesForConv = profiles?.filter(p => p.user_type === 'seller' || p.user_type === 'both') || [];

  if (buyerProfiles.length > 0 && sellerProfilesForConv.length > 0) {
    const buyer = buyerProfiles[0];
    const seller = sellerProfilesForConv[0];

    const { data: conversation } = await supabase.from('conversations').insert({
      participant_1_id: buyer.id,
      participant_2_id: seller.id,
    }).select().single();

    if (conversation) {
      await supabase.from('messages').insert([
        {
          conversation_id: conversation.id,
          sender_id: buyer.id,
          content: 'Hi, I\'m interested in your products!',
        },
        {
          conversation_id: conversation.id,
          sender_id: seller.id,
          content: 'Hello! Thank you for your interest. How can I help you?',
        },
        {
          conversation_id: conversation.id,
          sender_id: buyer.id,
          content: 'Can you provide more details about the pricing?',
        },
      ]);
      console.log(`✓ Created 1 conversation with 3 messages\n`);
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('   Buyer: user1@example.com / password123');
  console.log('   Seller: user4@example.com / password123');
  console.log('   Both: user7@example.com / password123');
}

seed().catch(console.error);
