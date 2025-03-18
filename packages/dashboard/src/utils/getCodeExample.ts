
export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
export type Language = "js" | "python" | "curl" | "php" | "go" | "rust" | "java" | "csharp"



export const getCodeExample = (language: Language, url: string, method: Method): string => {
    const headers = '{"x-api-key": "YOUR_API_KEY"}'

    const examples = {
        js: `const fetchData = async () => {
  try {
    const response = await fetch("${url}", {
      method: "${method}",
      headers: ${headers}
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

fetchData();`,

        python: `import requests

url = "${url}"
headers = ${headers}

response = requests.${method.toLowerCase()}(url, headers=headers)
print(response.json())`,

        curl: `curl -X ${method} "${url}" \\
  -H "x-api-key: YOUR_API_KEY"`,

        php: `<?php
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "${url}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "x-api-key: YOUR_API_KEY"
    ],
    CURLOPT_CUSTOMREQUEST => "${method}"
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    echo "Error: " . $err;
} else {
    echo $response;
}`,

        go: `package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    client := &http.Client{}
    req, err := http.NewRequest("${method}", "${url}", nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("x-api-key", "YOUR_API_KEY")

    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}`,

        rust: `use reqwest;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let res = client.${method.toLowerCase()}("${url}")
        .header("x-api-key", "YOUR_API_KEY")
        .send()
        .await?;
    
    let body = res.text().await?;
    println!("{}", body);
    Ok(())
}`,

        java: `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class ApiCall {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${url}"))
            .header("x-api-key", "YOUR_API_KEY")
            .method("${method}", HttpRequest.BodyPublishers.noBody())
            .build();

        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .thenApply(HttpResponse::body)
            .thenAccept(System.out::println)
            .join();
    }
}`,

        csharp: `using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("x-api-key", "YOUR_API_KEY");

        var response = await client.${method === "GET" ? "GetAsync" : `${method}Async`}("${url}");
        var content = await response.Content.ReadAsStringAsync();
        
        Console.WriteLine(content);
    }
}`
    }

    return examples[language] || examples.js
}
