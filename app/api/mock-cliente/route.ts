import { NextResponse } from "next/server"

// This is a mock API endpoint to simulate the client API when it's not available
export async function GET() {
  // Generate a random customer
  const firstNames = ["Maria", "João", "Ana", "Pedro", "Luiza", "Carlos", "Fernanda", "José"]
  const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa"]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

  // Generate a random CPF (for testing only)
  const generateCPF = () => {
    const numbers = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
    return numbers.join("") + "00" // Simplified CPF for testing
  }

  const customer = {
    nome: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    cpf: generateCPF(),
  }

  return NextResponse.json(customer)
}
