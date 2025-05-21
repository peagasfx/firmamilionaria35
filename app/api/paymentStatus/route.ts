// app/api/paymentStatus/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get("transactionId")

  if (!transactionId) {
    return new Response(
      JSON.stringify({ success: false, error: "ID da transação é obrigatório." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  const publicKey = "pk_Y9Pebq7ovwbWcvN4ZBV_eK8dyXxTBNu1dqmnYW1-Vul__KRS"
  const secretKey = "sk_3OIX92WBebFeOt_bi_xOCox6wWxKI4obGVf1k2AD6SLK__nM"
  const auth = "Basic " + Buffer.from(`${publicKey}:${secretKey}`).toString("base64")
  const url = `https://api.clyptpayments.com/v1/transactions/${transactionId}`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: data?.message || data?.error || "Erro ao buscar status.",
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, status: data.status, full: data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno ao consultar status." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
