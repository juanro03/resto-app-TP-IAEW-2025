// Ejecutar: node scripts/migrations-and-seed.js
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URL || 'mongodb://mongo:27017/?replicaSet=rs0';
const dbName = 'resto';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // -------- productos: colección + validador + índice único --------
  try {
    await db.createCollection('productos', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["nombre", "precio", "stock"],
          additionalProperties: false,
          properties: {
            nombre: { bsonType: "string", minLength: 1 },
            precio: { bsonType: ["double","int","decimal"], minimum: 0 },
            stock:  { bsonType: "int", minimum: 0 }
          }
        }
      }
    });
  } catch (e) { /* si existe, ignoro */ }

  await db.collection('productos').createIndex({ nombre: 1 }, { unique: true });

  // -------- pedidos: colección + validador + índices --------
  try {
    await db.createCollection('pedidos', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["estado", "total", "items"],
          additionalProperties: false,
          properties: {
            estado: { enum: ["pendiente","preparando","listo"] },
            total:  { bsonType: ["double","int","decimal"], minimum: 0 },
            items: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "object",
                required: ["productoId","nombre","cantidad","precioUnitario","subtotal"],
                additionalProperties: false,
                properties: {
                  productoId: { bsonType: "objectId" },
                  nombre: { bsonType: "string", minLength: 1 },
                  cantidad: { bsonType: "int", minimum: 1 },
                  precioUnitario: { bsonType: ["double","int","decimal"], minimum: 0 },
                  subtotal: { bsonType: ["double","int","decimal"], minimum: 0 }
                }
              }
            }
          }
        }
      }
    });
  } catch (e) { /* si existe, ignoro */ }

  await db.collection('pedidos').createIndex({ estado: 1 });
  await db.collection('pedidos').createIndex({ estado: 1, _id: -1 });

  // -------- seed: 3 productos + 1 pedido pendiente --------
  const productos = db.collection('productos');
  await productos.deleteMany({});
  const { insertedIds } = await productos.insertMany([
    { nombre: "Milanesa",   precio: 6000, stock: 25 },
    { nombre: "Pizza Muzza",precio: 7000, stock: 20 },
    { nombre: "Agua",       precio: 1200, stock: 120 }
  ]);

  const pedidos = db.collection('pedidos');
  await pedidos.deleteMany({});
  await pedidos.insertOne({
    estado: "pendiente",
    total: 13200,
    items: [
      { productoId: insertedIds['0'], nombre: "Milanesa", cantidad: 2, precioUnitario: 6000, subtotal: 12000 },
      { productoId: insertedIds['2'], nombre: "Agua",     cantidad: 1, precioUnitario: 1200, subtotal: 1200 }
    ]
  });

  console.log("Migración + seed OK");
  await client.close();
})().catch(e => { console.error(e); process.exit(1); });
