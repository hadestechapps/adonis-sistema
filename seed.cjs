// Seed inicial de usuarios, categorías, productos, ubicaciones, planograma y lecciones
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const passAdmin = await bcrypt.hash('Admin123!@#', 10);
  const passBod = await bcrypt.hash('Bodega123!@#', 10);
  const passUsr = await bcrypt.hash('Usuario123!@#', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@example.com', password: passAdmin, role: 'admin' }
  });
  const bodeguero = await prisma.user.upsert({
    where: { email: 'bodeguero@example.com' },
    update: {},
    create: { name: 'Bodeguero', email: 'bodeguero@example.com', password: passBod, role: 'bodeguero' }
  });
  const usuario = await prisma.user.upsert({
    where: { email: 'usuario@example.com' },
    update: {},
    create: { name: 'Usuario', email: 'usuario@example.com', password: passUsr, role: 'usuario' }
  });

  const catA = await prisma.category.upsert({
    where: { name: 'Abarrotes' },
    update: {},
    create: { name: 'Abarrotes' }
  });
  const catV = await prisma.category.upsert({
    where: { name: 'Verduras' },
    update: {},
    create: { name: 'Verduras' }
  });

  // Ubicaciones
  const locBod = await prisma.location.create({ data: { tipo: 'bodega', pasillo: 'B1', rack: 'R1', seccion: 'S1' } });
  const locPiso = await prisma.location.create({ data: { tipo: 'piso', pasillo: '1', rack: 'A', seccion: '1' } });
  const locTras = await prisma.location.create({ data: { tipo: 'trastienda', pasillo: 'T1', rack: 'TR', seccion: '1' } });

  // Productos
  for (let i = 1; i <= 10; i++) {
    const p = await prisma.product.create({
      data: {
        sku: `SKU-${i.toString().padStart(3,'0')}`,
        name: `Producto ${i}`,
        description: `Descripción del producto ${i}`,
        categoryId: i % 2 ? catA.id : catV.id
      }
    });
    await prisma.productLocation.createMany({
      data: [
        { productId: p.id, locationId: locBod.id, cantidad: 10 + i },
        { productId: p.id, locationId: locPiso.id, cantidad: 5 + i },
        { productId: p.id, locationId: locTras.id, cantidad: 2 + i }
      ]
    });
    await prisma.productPhoto.createMany({
      data: [
        { productId: p.id, locationId: locPiso.id, path: `/uploads/demo_piso_${i}.jpg`, caption: 'Piso' },
        { productId: p.id, locationId: locTras.id, path: `/uploads/demo_trastienda_${i}.jpg`, caption: 'Trastienda' },
        { productId: p.id, locationId: locBod.id, path: `/uploads/demo_bodega_${i}.jpg`, caption: 'Bodega' }
      ]
    });
  }

  await prisma.planogram.upsert({
    where: { id: 1 },
    update: { contenidoMd: '## Planograma de tienda\n\nÚltima actualización automática de seed.', updatedById: admin.id },
    create: { id: 1, contenidoMd: '## Planograma de tienda\n\nMapa y distribución inicial.', updatedById: admin.id }
  });

  await prisma.lesson.createMany({
    data: [
      {
        categoria: 'frutas_verduras',
        titulo: 'Cómo escoger aguacates',
        descripcion: 'Guía breve para elegir aguacates maduros',
        tipo: 'articulo',
        contenidoMd: 'Consejos para presionar suavemente y revisar color.',
        publicado: true
      },
      {
        categoria: 'frutas_verduras',
        titulo: 'Video: Selección de manzanas',
        descripcion: 'Video introductorio',
        tipo: 'video',
        mediaPath: 'https://example.com/video.mp4',
        contenidoMd: 'Video de referencia.',
        publicado: true
      },
      {
        categoria: 'general',
        titulo: 'Almacenamiento seguro',
        descripcion: 'Buenas prácticas de bodega',
        tipo: 'articulo',
        contenidoMd: 'Mantener seco y ventilado.',
        publicado: true
      }
    ]
  });

  console.log('Seed completado. Usuarios:');
  console.log(' admin@example.com / Admin123!@#');
  console.log(' bodeguero@example.com / Bodega123!@#');
  console.log(' usuario@example.com / Usuario123!@#');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
