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

  const publicKey = "pk_YTXQ5NLgLtSkFdUgBev0iZwhUr5WTVzcAPGBdnTaxGkA6aij"
  const secretKey = "sk_Y6CoQfzXE26gHHi6D-oPIfHHSGbddWoTjl6Y2nLiXm1hNsOp"
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
