export interface CodeExample {
  language: string;
  label: string;
  code: string;
}

const BASE_URL = "https://qr-platby.com/api/v1/qr";

export const codeExamples: CodeExample[] = [
  {
    language: "curl",
    label: "cURL",
    code: `curl -X POST ${BASE_URL} \\
  -H "Content-Type: application/json" \\
  -d '{
    "iban": "SK3112000000198742637541",
    "amount": 25.50,
    "currency": "EUR",
    "variableSymbol": "2024001"
  }'`,
  },
  {
    language: "javascript",
    label: "JavaScript",
    code: `const response = await fetch("${BASE_URL}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    iban: "SK3112000000198742637541",
    amount: 25.50,
    currency: "EUR",
    variableSymbol: "2024001",
  }),
});

const data = await response.json();

if (data.success) {
  // data.data contains base64 PNG data URI
  document.querySelector("img").src = data.data;
}`,
  },
  {
    language: "python",
    label: "Python",
    code: `import requests

response = requests.post(
    "${BASE_URL}",
    json={
        "iban": "SK3112000000198742637541",
        "amount": 25.50,
        "currency": "EUR",
        "variableSymbol": "2024001",
    },
)

data = response.json()

if data["success"]:
    # data["data"] contains base64 PNG data URI
    print(data["data"][:80] + "...")`,
  },
  {
    language: "php",
    label: "PHP",
    code: `$response = file_get_contents(
    "${BASE_URL}",
    false,
    stream_context_create([
        "http" => [
            "method" => "POST",
            "header" => "Content-Type: application/json",
            "content" => json_encode([
                "iban" => "SK3112000000198742637541",
                "amount" => 25.50,
                "currency" => "EUR",
                "variableSymbol" => "2024001",
            ]),
        ],
    ])
);

$data = json_decode($response, true);

if ($data["success"]) {
    echo '<img src="' . $data["data"] . '" />';
}`,
  },
  {
    language: "go",
    label: "Go",
    code: `payload := map[string]any{
    "iban":           "SK3112000000198742637541",
    "amount":         25.50,
    "currency":       "EUR",
    "variableSymbol": "2024001",
}

body, _ := json.Marshal(payload)

resp, err := http.Post(
    "${BASE_URL}",
    "application/json",
    bytes.NewReader(body),
)
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()

var result struct {
    Success bool   \`json:"success"\`
    Data    string \`json:"data"\`
}
json.NewDecoder(resp.Body).Decode(&result)

if result.Success {
    // result.Data contains base64 PNG data URI
    fmt.Println(result.Data[:80] + "...")
}`,
  },
  {
    language: "csharp",
    label: "C#",
    code: `using var client = new HttpClient();

var response = await client.PostAsJsonAsync(
    "${BASE_URL}",
    new {
        iban = "SK3112000000198742637541",
        amount = 25.50,
        currency = "EUR",
        variableSymbol = "2024001"
    }
);

var data = await response.Content
    .ReadFromJsonAsync<JsonElement>();

if (data.GetProperty("success").GetBoolean())
{
    var qrDataUri = data
        .GetProperty("data").GetString();
}`,
  },
];
