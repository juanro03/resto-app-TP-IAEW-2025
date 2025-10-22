// Ejecutar: node scripts/migrate-and-seed.js
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URL || 'mongodb://mongo:27017/?replicaSet=rs0';
const dbName = 'resto';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const productos = db.collection('productos');
  await productos.deleteMany({});
  await productos.insertMany([
    { nombre: "Milanesa", precio: 6000, stock: 25 },
    { nombre: "Pizza Muzza", precio: 7000, stock: 20 },
    { nombre: "Agua", precio: 1200, stock: 120 }
  ]);

  console.log("Migración + seed OK");
  await client.close();
})();
