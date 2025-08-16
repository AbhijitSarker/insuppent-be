import { initializeDatabase, sequelize } from '../db/sequelize.js';
// Import all models before initializing database to ensure registration
import { User } from '../app/modules/user/user.model.js';
import { Lead } from '../app/modules/lead/lead.model.js';
import { Admin } from '../app/modules/admin/admin.model.js';

async function runSeed() {
  try {
    await initializeDatabase();

    // Seed admin if none exists
    const adminCount = await Admin.count();
    if (adminCount === 0) {
      await Admin.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'secret123',
        role: 'admin',
        status: 'active',
      });
      console.log('Seeded default admin: admin@example.com / secret123');
    }

    // Seed users if none exists
    const userCount = await User.count();
    if (userCount === 0) {
      await User.bulkCreate([
        { name: 'Courtney Henry', email: 'courtney.henry@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'C' },
        { name: 'Floyd Miles', email: 'floyd.miles@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'F' },
        { name: 'Kristin Watson', email: 'kristin.watson@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'K' },
        { name: 'Robert Fox', email: 'robert.fox@example.com', password: 'password123', status: 'inactive', subscription: 'Basic', avatar: 'R' },
        { name: 'Jane Cooper', email: 'jane.cooper@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'J' },
        { name: 'Leslie Alexander', email: 'leslie.alexander@example.com', password: 'password123', status: 'inactive', subscription: 'Basic', avatar: 'L' },
        { name: 'Dianne Russell', email: 'dianne.russell@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'D' },
        { name: 'Brooklyn Simmons', email: 'brooklyn.simmons@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'B' },
        { name: 'Jacob Jones', email: 'jacob.jones@example.com', password: 'password123', status: 'inactive', subscription: 'Basic', avatar: 'J' },
        { name: 'Kathryn Murphy', email: 'kathryn.murphy@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'K' },
        { name: 'Ronald Richards', email: 'ronald.richards@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'R' },
        { name: 'Debbie Baker', email: 'debbie.baker@example.com', password: 'password123', status: 'inactive', subscription: 'Basic', avatar: 'D' },
        { name: 'Jessica Hanson', email: 'jessica.hanson@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'J' },
        { name: 'Michael Chen', email: 'michael.chen@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'M' },
        { name: 'Sarah Davis', email: 'sarah.davis@example.com', password: 'password123', status: 'inactive', subscription: 'Basic', avatar: 'S' },
        { name: 'David Wilson', email: 'david.wilson@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'D' },
        { name: 'Emily Taylor', email: 'emily.taylor@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'E' },
        { name: 'James Lee', email: 'james.lee@example.com', password: 'password123', status: 'inactive', subscription: 'Basic', avatar: 'J' },
        { name: 'Linda Martinez', email: 'linda.martinez@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'L' },
        { name: 'Thomas Clark', email: 'thomas.clark@example.com', password: 'password123', status: 'active', subscription: 'Basic', avatar: 'T' },
      ]);
      console.log('Seeded sample users');
    }

    // Seed leads if none exists
    const leadCount = await Lead.count();
    if (leadCount === 0) {
      await Lead.bulkCreate([
        {
          name: 'Alice Brown',
          email: 'alice.brown@example.com',
          phone: '5552345678',
          address: '101 Elm St',
          zipCode: '60601',
          state: 'IL',
          type: 'auto',
          status: 'public',
          saleCount: 2,
          maxLeadSaleCount: 3
        },
        {
          name: "Michael Chen",
          email: "michael.chen@example.com",
          phone: "5553456789",
          address: "202 Birch Ln",
          zipCode: "33101",
          state: "FL",
          type: "home",
          status: "private",
          saleCount: 0,
          maxLeadSaleCount: 3
        },
        {
          "name": "Sarah Davis",
          "email": "sarah.davis@example.com",
          "phone": "5554567890",
          "address": "303 Cedar Dr",
          "zipCode": "98101",
          "state": "WA",
          "type": "mortgage",
          "status": "public",
          "saleCount": 1,
          "maxLeadSaleCount": 3
        },
        {
          "name": "David Wilson",
          "email": "david.wilson@example.com",
          "phone": "5555678901",
          "address": "404 Maple Ave",
          "zipCode": "80202",
          "state": "CO",
          "type": "auto",
          "status": "private",
          "saleCount": 3,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Emily Taylor",
          "email": "emily.taylor@example.com",
          "phone": "5556789012",
          "address": "505 Spruce Ct",
          "zipCode": "94102",
          "state": "CA",
          "type": "home",
          "status": "public",
          "saleCount": 0,
          "maxLeadSaleCount": 3
        },
        {
          "name": "James Lee",
          "email": "james.lee@example.com",
          "phone": "5557890123",
          "address": "606 Willow Rd",
          "zipCode": "77002",
          "state": "TX",
          "type": "mortgage",
          "status": "private",
          "saleCount": 2,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Linda Martinez",
          "email": "linda.martinez@example.com",
          "phone": "5558901234",
          "address": "707 Oak St",
          "zipCode": "85001",
          "state": "AZ",
          "type": "auto",
          "status": "public",
          "saleCount": 1,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Thomas Clark",
          "email": "thomas.clark@example.com",
          "phone": "5559012345",
          "address": "808 Pine Ln",
          "zipCode": "19103",
          "state": "PA",
          "type": "home",
          "status": "private",
          "saleCount": 0,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Patricia Adams",
          "email": "patricia.adams@example.com",
          "phone": "5550123456",
          "address": "909 Cedar Ave",
          "zipCode": "37203",
          "state": "TN",
          "type": "mortgage",
          "status": "public",
          "saleCount": 2,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Robert White",
          "email": "robert.white@example.com",
          "phone": "5551234568",
          "address": "1010 Elm Dr",
          "zipCode": "55401",
          "state": "MN",
          "type": "auto",
          "status": "private",
          "saleCount": 1,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Jennifer King",
          "email": "jennifer.king@example.com",
          "phone": "5552345679",
          "address": "1111 Birch St",
          "zipCode": "30301",
          "state": "GA",
          "type": "home",
          "status": "public",
          "saleCount": 0,
          "maxLeadSaleCount": 3
        },
        {
          "name": "William Harris",
          "email": "william.harris@example.com",
          "phone": "5553456780",
          "address": "1212 Maple Rd",
          "zipCode": "43215",
          "state": "OH",
          "type": "mortgage",
          "status": "private",
          "saleCount": 3,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Susan Lewis",
          "email": "susan.lewis@example.com",
          "phone": "5554567891",
          "address": "1313 Spruce Ave",
          "zipCode": "28202",
          "state": "NC",
          "type": "auto",
          "status": "public",
          "saleCount": 2,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Charles Walker",
          "email": "charles.walker@example.com",
          "phone": "5555678902",
          "address": "1414 Willow Ct",
          "zipCode": "64105",
          "state": "MO",
          "type": "home",
          "status": "private",
          "saleCount": 0,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Mary Young",
          "email": "mary.young@example.com",
          "phone": "5556789013",
          "address": "1515 Oak Dr",
          "zipCode": "92101",
          "state": "CA",
          "type": "mortgage",
          "status": "public",
          "saleCount": 1,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Daniel Hall",
          "email": "daniel.hall@example.com",
          "phone": "5557890124",
          "address": "1616 Pine St",
          "zipCode": "80203",
          "state": "CO",
          "type": "auto",
          "status": "private",
          "saleCount": 2,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Nancy Allen",
          "email": "nancy.allen@example.com",
          "phone": "5558901235",
          "address": "1717 Cedar Ln",
          "zipCode": "60602",
          "state": "IL",
          "type": "home",
          "status": "public",
          "saleCount": 0,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Mark Turner",
          "email": "mark.turner@example.com",
          "phone": "5559012346",
          "address": "1818 Elm Ave",
          "zipCode": "33102",
          "state": "FL",
          "type": "mortgage",
          "status": "private",
          "saleCount": 1,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Lisa Moore",
          "email": "lisa.moore@example.com",
          "phone": "5550123457",
          "address": "1919 Birch Rd",
          "zipCode": "98102",
          "state": "WA",
          "type": "auto",
          "status": "public",
          "saleCount": 3,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Paul Green",
          "email": "paul.green@example.com",
          "phone": "5551234569",
          "address": "2020 Maple Dr",
          "zipCode": "77003",
          "state": "TX",
          "type": "home",
          "status": "private",
          "saleCount": 0,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Karen Scott",
          "email": "karen.scott@example.com",
          "phone": "5552345670",
          "address": "2121 Spruce St",
          "zipCode": "85002",
          "state": "AZ",
          "type": "mortgage",
          "status": "public",
          "saleCount": 2,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Steven Baker",
          "email": "steven.baker@example.com",
          "phone": "5553456781",
          "address": "2222 Willow Ave",
          "zipCode": "19104",
          "state": "PA",
          "type": "auto",
          "status": "private",
          "saleCount": 1,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Donna Evans",
          "email": "donna.evans@example.com",
          "phone": "5554567892",
          "address": "2323 Oak Ct",
          "zipCode": "37204",
          "state": "TN",
          "type": "home",
          "status": "public",
          "saleCount": 0,
          "maxLeadSaleCount": 3
        },
        {
          "name": "George Nelson",
          "email": "george.nelson@example.com",
          "phone": "5555678903",
          "address": "2424 Pine Dr",
          "zipCode": "55402",
          "state": "MN",
          "type": "mortgage",
          "status": "private",
          "saleCount": 2,
          "maxLeadSaleCount": 3
        },
        {
          "name": "Betty Carter",
          "email": "betty.carter@example.com",
          "phone": "5556789014",
          "address": "2525 Cedar Rd",
          "zipCode": "30302",
          "state": "GA",
          "type": "auto",
          "status": "public",
          "saleCount": 1,
          "maxLeadSaleCount": 3
        }
      ]);
      console.log('Seeded sample leads');
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seed failed', err);
  } finally {
    await sequelize.close();
  }
}

runSeed();

