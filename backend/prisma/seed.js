import { PrismaClient } from '../src/generated/prisma/client.js';
import { hashPassword } from '../src/utils/hashPassword.js';

const prisma = new PrismaClient();

async function main() {
  // 1. Crear usuario administrador
  const adminEmail = 'admin@sandbook.com';
  const adminPassword = 'admin123';

  console.log(`Verificando si el usuario ${adminEmail} existe...`);

  const hashedPassword = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`✔️ Usuario administrador creado/actualizado: ${admin.email}`);

  // 2. Crear categorías de libros
  console.log('Creando categorías de libros...');
  
  const categories = [
    { name: 'Ficción', slug: 'ficcion' },
    { name: 'No Ficción', slug: 'no-ficcion' },
    { name: 'Ciencia Ficción', slug: 'ciencia-ficcion' },
    { name: 'Misterio', slug: 'misterio' },
    { name: 'Romance', slug: 'romance' },
    { name: 'Fantasía', slug: 'fantasia' },
    { name: 'Biografías', slug: 'biografias' },
    { name: 'Historia', slug: 'historia' },
    { name: 'Ciencia', slug: 'ciencia' },
    { name: 'Tecnología', slug: 'tecnologia' },
    { name: 'Autoayuda', slug: 'autoayuda' },
    { name: 'Negocios', slug: 'negocios' },
    { name: 'Arte y Diseño', slug: 'arte-diseno' },
    { name: 'Cocina', slug: 'cocina' },
    { name: 'Viajes', slug: 'viajes' }
  ];

  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
    console.log(`✔️ Categoría creada: ${createdCategory.name}`);
  }

  // 3. Crear algunos productos de ejemplo con categorías
  console.log('Creando productos de ejemplo...');
  
  const sampleProducts = [
    {
      name: 'El Quijote',
      description: 'La obra maestra de Miguel de Cervantes',
      price: 25.99,
      stock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
      categorySlug: 'ficcion'
    },
    {
      name: 'Cien Años de Soledad',
      description: 'Novela del realismo mágico de Gabriel García Márquez',
      price: 22.50,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      categorySlug: 'ficcion'
    },
    {
      name: 'Sapiens',
      description: 'Una breve historia de la humanidad',
      price: 28.00,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
      categorySlug: 'historia'
    },
    {
      name: 'Dune',
      description: 'Épica de ciencia ficción de Frank Herbert',
      price: 30.00,
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      categorySlug: 'ciencia-ficcion'
    },
    {
      name: 'El Señor de los Anillos',
      description: 'Trilogía épica de fantasía de J.R.R. Tolkien',
      price: 45.00,
      stock: 6,
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300',
      categorySlug: 'fantasia'
    }
  ];

  for (const productData of sampleProducts) {
    // Buscar la categoría por slug
    const category = await prisma.category.findUnique({
      where: { slug: productData.categorySlug }
    });

    if (category) {
      // Verificar si el producto ya existe
      const existingProduct = await prisma.product.findFirst({
        where: { name: productData.name }
      });

      if (!existingProduct) {
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
            imageUrl: productData.imageUrl,
            categoryId: category.id
          }
        });
        console.log(`✔️ Producto creado: ${product.name} (${category.name})`);
      } else {
        console.log(`⚠️ Producto ya existe: ${productData.name}`);
      }
    }
  }

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });