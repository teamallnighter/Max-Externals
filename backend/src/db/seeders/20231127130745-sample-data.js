const db = require('../models');
const Users = db.users;

const Posts = db.posts;

const Devices = db.devices;

const Studios = db.studios;

const Transactions = db.transactions;

const PostsData = [
  {
    title: 'Getting Started with Max MSP',

    content: "A beginner's guide to creating your first Max MSP external.",

    // type code here for "relation_one" field

    posted_at: new Date('2023-01-01T12:00:00Z'),
  },

  {
    title: 'Max for Live Performance Tips',

    content: 'Enhance your live performances with these Max for Live devices.',

    // type code here for "relation_one" field

    posted_at: new Date('2023-01-02T12:00:00Z'),
  },

  {
    title: 'Ambient Soundscapes',

    content: 'Creating immersive ambient soundscapes using Max MSP.',

    // type code here for "relation_one" field

    posted_at: new Date('2023-01-03T12:00:00Z'),
  },

  {
    title: 'Drum Programming in Max',

    content: 'Advanced techniques for drum programming in Max MSP.',

    // type code here for "relation_one" field

    posted_at: new Date('2023-01-04T12:00:00Z'),
  },

  {
    title: 'Modular Synthesis with Max',

    content: 'Exploring modular synthesis through Max MSP externals.',

    // type code here for "relation_one" field

    posted_at: new Date('2023-01-05T12:00:00Z'),
  },
];

const DevicesData = [
  {
    title: 'Richard Feynman',

    price: 85.86,

    description: 'Konrad Lorenz',

    // type code here for "images" field

    // type code here for "relation_one" field

    category: 'max_for_live_devices',

    is_free: false,
  },

  {
    title: 'Claude Levi-Strauss',

    price: 40.11,

    description: 'Anton van Leeuwenhoek',

    // type code here for "images" field

    // type code here for "relation_one" field

    category: 'max_for_live_devices',

    is_free: true,
  },

  {
    title: 'Ernst Mayr',

    price: 98.38,

    description: 'Richard Feynman',

    // type code here for "images" field

    // type code here for "relation_one" field

    category: 'max_for_live_devices',

    is_free: true,
  },

  {
    title: 'Paul Dirac',

    price: 22.59,

    description: 'Gertrude Belle Elion',

    // type code here for "images" field

    // type code here for "relation_one" field

    category: 'max_msp_externals',

    is_free: false,
  },

  {
    title: 'Stephen Hawking',

    price: 19.38,

    description: 'Francis Crick',

    // type code here for "images" field

    // type code here for "relation_one" field

    category: 'max_for_live_devices',

    is_free: true,
  },
];

const StudiosData = [
  {
    name: "Jane's Creations",

    description: 'A studio for innovative Max MSP externals',

    // type code here for "relation_one" field

    externalwebsite: 'Konrad Lorenz',
  },

  {
    name: 'Max Solutions',

    description: 'Max for Live devices and more',

    // type code here for "relation_one" field

    externalwebsite: 'Thomas Hunt Morgan',
  },

  {
    name: 'Sound Innovations',

    description: 'Exploring sound through technology',

    // type code here for "relation_one" field

    externalwebsite: 'Jonas Salk',
  },

  {
    name: 'Digital Soundscapes',

    description: 'Crafting digital experiences in sound',

    // type code here for "relation_one" field

    externalwebsite: 'Ernst Mayr',
  },

  {
    name: 'Modular Beats',

    description: 'Your go-to studio for modular synths',

    // type code here for "relation_one" field

    externalwebsite: 'Charles Darwin',
  },
];

const TransactionsData = [
  {
    amount: 49.99,

    transaction_date: new Date('2023-01-06T15:00:00Z'),

    // type code here for "relation_one" field

    // type code here for "relation_one" field

    // type code here for "relation_one" field
  },

  {
    amount: 59.99,

    transaction_date: new Date('2023-01-07T15:30:00Z'),

    // type code here for "relation_one" field

    // type code here for "relation_one" field

    // type code here for "relation_one" field
  },

  {
    amount: 39.99,

    transaction_date: new Date('2023-01-08T16:00:00Z'),

    // type code here for "relation_one" field

    // type code here for "relation_one" field

    // type code here for "relation_one" field
  },

  {
    amount: 29.99,

    transaction_date: new Date('2023-01-09T16:30:00Z'),

    // type code here for "relation_one" field

    // type code here for "relation_one" field

    // type code here for "relation_one" field
  },

  {
    amount: 69.99,

    transaction_date: new Date('2023-01-10T17:00:00Z'),

    // type code here for "relation_one" field

    // type code here for "relation_one" field

    // type code here for "relation_one" field
  },
];

// Similar logic for "relation_many"

async function associatePostWithAuthor() {
  const relatedAuthor0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Post0 = await Posts.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Post0?.setAuthor) {
    await Post0.setAuthor(relatedAuthor0);
  }

  const relatedAuthor1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Post1 = await Posts.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Post1?.setAuthor) {
    await Post1.setAuthor(relatedAuthor1);
  }

  const relatedAuthor2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Post2 = await Posts.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Post2?.setAuthor) {
    await Post2.setAuthor(relatedAuthor2);
  }

  const relatedAuthor3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Post3 = await Posts.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Post3?.setAuthor) {
    await Post3.setAuthor(relatedAuthor3);
  }

  const relatedAuthor4 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Post4 = await Posts.findOne({
    order: [['id', 'ASC']],
    offset: 4,
  });
  if (Post4?.setAuthor) {
    await Post4.setAuthor(relatedAuthor4);
  }
}

async function associateDeviceWithStudio() {
  const relatedStudio0 = await Studios.findOne({
    offset: Math.floor(Math.random() * (await Studios.count())),
  });
  const Device0 = await Devices.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Device0?.setStudio) {
    await Device0.setStudio(relatedStudio0);
  }

  const relatedStudio1 = await Studios.findOne({
    offset: Math.floor(Math.random() * (await Studios.count())),
  });
  const Device1 = await Devices.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Device1?.setStudio) {
    await Device1.setStudio(relatedStudio1);
  }

  const relatedStudio2 = await Studios.findOne({
    offset: Math.floor(Math.random() * (await Studios.count())),
  });
  const Device2 = await Devices.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Device2?.setStudio) {
    await Device2.setStudio(relatedStudio2);
  }

  const relatedStudio3 = await Studios.findOne({
    offset: Math.floor(Math.random() * (await Studios.count())),
  });
  const Device3 = await Devices.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Device3?.setStudio) {
    await Device3.setStudio(relatedStudio3);
  }

  const relatedStudio4 = await Studios.findOne({
    offset: Math.floor(Math.random() * (await Studios.count())),
  });
  const Device4 = await Devices.findOne({
    order: [['id', 'ASC']],
    offset: 4,
  });
  if (Device4?.setStudio) {
    await Device4.setStudio(relatedStudio4);
  }
}

async function associateStudioWithOwner() {
  const relatedOwner0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Studio0 = await Studios.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Studio0?.setOwner) {
    await Studio0.setOwner(relatedOwner0);
  }

  const relatedOwner1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Studio1 = await Studios.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Studio1?.setOwner) {
    await Studio1.setOwner(relatedOwner1);
  }

  const relatedOwner2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Studio2 = await Studios.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Studio2?.setOwner) {
    await Studio2.setOwner(relatedOwner2);
  }

  const relatedOwner3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Studio3 = await Studios.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Studio3?.setOwner) {
    await Studio3.setOwner(relatedOwner3);
  }

  const relatedOwner4 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Studio4 = await Studios.findOne({
    order: [['id', 'ASC']],
    offset: 4,
  });
  if (Studio4?.setOwner) {
    await Studio4.setOwner(relatedOwner4);
  }
}

async function associateTransactionWithBuyer() {
  const relatedBuyer0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction0 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Transaction0?.setBuyer) {
    await Transaction0.setBuyer(relatedBuyer0);
  }

  const relatedBuyer1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction1 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Transaction1?.setBuyer) {
    await Transaction1.setBuyer(relatedBuyer1);
  }

  const relatedBuyer2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction2 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Transaction2?.setBuyer) {
    await Transaction2.setBuyer(relatedBuyer2);
  }

  const relatedBuyer3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction3 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Transaction3?.setBuyer) {
    await Transaction3.setBuyer(relatedBuyer3);
  }

  const relatedBuyer4 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction4 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 4,
  });
  if (Transaction4?.setBuyer) {
    await Transaction4.setBuyer(relatedBuyer4);
  }
}

async function associateTransactionWithProduct() {
  const relatedProduct0 = await Devices.findOne({
    offset: Math.floor(Math.random() * (await Devices.count())),
  });
  const Transaction0 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Transaction0?.setProduct) {
    await Transaction0.setProduct(relatedProduct0);
  }

  const relatedProduct1 = await Devices.findOne({
    offset: Math.floor(Math.random() * (await Devices.count())),
  });
  const Transaction1 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Transaction1?.setProduct) {
    await Transaction1.setProduct(relatedProduct1);
  }

  const relatedProduct2 = await Devices.findOne({
    offset: Math.floor(Math.random() * (await Devices.count())),
  });
  const Transaction2 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Transaction2?.setProduct) {
    await Transaction2.setProduct(relatedProduct2);
  }

  const relatedProduct3 = await Devices.findOne({
    offset: Math.floor(Math.random() * (await Devices.count())),
  });
  const Transaction3 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Transaction3?.setProduct) {
    await Transaction3.setProduct(relatedProduct3);
  }

  const relatedProduct4 = await Devices.findOne({
    offset: Math.floor(Math.random() * (await Devices.count())),
  });
  const Transaction4 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 4,
  });
  if (Transaction4?.setProduct) {
    await Transaction4.setProduct(relatedProduct4);
  }
}

async function associateTransactionWithSeller() {
  const relatedSeller0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction0 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Transaction0?.setSeller) {
    await Transaction0.setSeller(relatedSeller0);
  }

  const relatedSeller1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction1 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Transaction1?.setSeller) {
    await Transaction1.setSeller(relatedSeller1);
  }

  const relatedSeller2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction2 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Transaction2?.setSeller) {
    await Transaction2.setSeller(relatedSeller2);
  }

  const relatedSeller3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction3 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Transaction3?.setSeller) {
    await Transaction3.setSeller(relatedSeller3);
  }

  const relatedSeller4 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Transaction4 = await Transactions.findOne({
    order: [['id', 'ASC']],
    offset: 4,
  });
  if (Transaction4?.setSeller) {
    await Transaction4.setSeller(relatedSeller4);
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Posts.bulkCreate(PostsData);

    await Devices.bulkCreate(DevicesData);

    await Studios.bulkCreate(StudiosData);

    await Transactions.bulkCreate(TransactionsData);

    await Promise.all([
      // Similar logic for "relation_many"

      await associatePostWithAuthor(),

      await associateDeviceWithStudio(),

      await associateStudioWithOwner(),

      await associateTransactionWithBuyer(),

      await associateTransactionWithProduct(),

      await associateTransactionWithSeller(),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('posts', null, {});

    await queryInterface.bulkDelete('devices', null, {});

    await queryInterface.bulkDelete('studios', null, {});

    await queryInterface.bulkDelete('transactions', null, {});
  },
};
