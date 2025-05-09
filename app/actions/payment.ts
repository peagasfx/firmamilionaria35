"use server"

const publicKey = "pk_YTXQ5NLgLtSkFdUgBev0iZwhUr5WTVzcAPGBdnTaxGkA6aij"
const secretKey = "sk_Y6CoQfzXE26gHHi6D-oPIfHHSGbddWoTjl6Y2nLiXm1hNsOp"

interface CustomerData {
  nome: string
  email: string
  cpf: string
}

interface PaymentResponse {
  success: boolean
  data?: any
  error?: string
}

function gerarCPF(): string {
  let cpf = '';

  // Gera os 9 primeiros dígitos aleatórios
  for (let i = 0; i < 9; i++) {
      cpf += Math.floor(Math.random() * 10).toString();
  }

  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf[i]) * (10 - i);
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;
  cpf += digito1.toString();

  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf[i]) * (11 - i);
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;
  cpf += digito2.toString();

  const invalidos = [
      '00000000000',
      '11111111111',
      '22222222222',
      '33333333333',
      '44444444444',
      '55555555555',
      '66666666666',
      '77777777777',
      '88888888888',
      '99999999999',
  ];

  // Verifica se o CPF gerado é inválido
  if (invalidos.includes(cpf)) {
      return gerarCPF(); // Tenta novamente
  }

  return cpf;
}

// Generate mock customer data
function getMockCustomerData(): CustomerData {
  // Generate a random customer
  const firstNames = ["Maria", "João", "Ana", "Pedro", "Luiza", "Carlos", "Fernanda", "José"]
  const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa"]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

  // Generate a random CPF (for testing only)

  return {
    nome: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.random()}@gmail.com`,
    cpf: gerarCPF(),
  }
}

export async function generatePixPayment(amount: number): Promise<PaymentResponse> {
  try {
    // Use mock customer data directly
    const customerData = getMockCustomerData()
    console.log("Using mock customer data:", customerData)

    // Ensure amount is a positive integer in cents
    const amountInCents = Math.round(amount * 100)

    if (amountInCents <= 0) {
      return {
        success: false,
        error: "O valor deve ser maior que zero",
      }
    }

    // Create payload EXACTLY matching the example format
    const payload = {
      amount: amountInCents,
      paymentMethod: "pix",
      customer: {
        name: customerData.nome,
        email: customerData.email,
        phone: "(11) 99999-9999",
        document:{
            type: "cpf",
            number: customerData.cpf.replace(/[^\d]/g, ""),
          },
      },
      items: [
        {
          title: "Produto",
          quantity: 1,
          unitPrice: amountInCents,
          tangible: false
        },
      ],
    }

    console.log("Sending payload:", JSON.stringify(payload, null, 2))

    // Use the exact URL from the documentation
    const url = "https://api.clyptpayments.com/v1/transactions"

    // Format authentication exactly as in the example
    const auth = "Basic " + Buffer.from(publicKey + ":" + secretKey).toString("base64")

    // Make the request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    // Get the response text first for debugging
    const responseText = await response.text()
    console.log("Response status:", response.status)
    console.log("Response text:", responseText)

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      return {
        success: false,
        error: "Resposta inválida da API",
      }
    }

    // Check if the request was successful
    if (!response.ok) {
      console.error("API error:", data)

      // Try to provide a more specific error message
      let errorMessage = "Erro ao gerar pagamento PIX"
      if (data && data.message) {
        errorMessage = data.message
      } else if (data && data.error) {
        errorMessage = data.error
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    // Success case
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error("Error in request:", error)
    return {
      success: false,
      error: "Erro ao processar o pagamento. Tente novamente.",
    }
  }
}
