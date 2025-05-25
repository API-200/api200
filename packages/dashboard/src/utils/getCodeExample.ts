export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
export type Language = "js" | "python" | "curl" | "php" | "go" | "rust" | "java" | "csharp"

// Helper function to generate SDK method name (matching your SDK generator logic)
function generateSDKMethodName(method: string, path: string): string {
    return `${method.toLowerCase()}_${path.replace(/^\//, '').replace(/\//g, '_')}`.replace(/{([^}]+)}/g, 'by_$1');
}

// Helper function to convert service name to camelCase (matching your SDK generator logic)
function toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Helper function to extract service name and endpoint path from URL
function parseApiUrl(url: string): { serviceName: string; endpointPath: string } {
    // Extract from URL like: https://eu.api200.co/api/users/profile/{id}
    const urlParts = url.split('/api/');
    if (urlParts.length < 2) {
        return { serviceName: 'service', endpointPath: '/endpoint' };
    }

    const pathParts = urlParts[1].split('/');
    const serviceName = pathParts[0] || 'service';
    const endpointPath = '/' + pathParts.slice(1).join('/');

    return { serviceName, endpointPath };
}

// Helper function to generate parameter example based on URL path
function generateSDKParams(url: string, method: Method): string {
    const pathParams = url.match(/{([^}]+)}/g);
    const hasRequestBody = ['POST', 'PUT', 'PATCH'].includes(method);

    if (!pathParams && !hasRequestBody) {
        return '';
    }

    const params: string[] = [];

    // Add path parameters
    if (pathParams) {
        pathParams.forEach(param => {
            const paramName = param.replace(/[{}]/g, '');
            params.push(`          ${paramName}: "your_${paramName}_value"`);
        });
    }

    // Add request body for POST, PUT, PATCH
    if (hasRequestBody) {
        params.push(`  requestBody: {
    // Your request data here
    name: "example",
    value: "data"
  }`);
    }

    return params.length > 0 ? `{\n${params.join(',\n')}\n     }` : '';
}

export const getCodeExample = (language: Language, url: string, method: Method): string => {
    const headers = '{"x-api-key": "YOUR_API_KEY"}'

    // For JavaScript, show SDK usage instead of fetch
    if (language === 'js') {
        const { serviceName, endpointPath } = parseApiUrl(url);
        const camelCaseServiceName = toCamelCase(serviceName);
        const methodName = generateSDKMethodName(method, endpointPath);
        const params = generateSDKParams(url, method);

        return `
import api200 from '@lib/api200';

const fetchData = async () => {
     const { data, error } = await api200.${camelCaseServiceName}.${methodName}.${method.toLowerCase()}(${params ? params : ''});
};

fetchData();`;
    }

    const examples = {
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

    return examples[language]
}
