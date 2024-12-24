const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Connexion à la base de données réussie.");

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany();
    console.log("Utilisateurs récupérés:", users);
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
