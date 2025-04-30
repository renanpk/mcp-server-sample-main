// src/sdkClientTest.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"; // <<< Use o transporte de CLIENTE stdio

async function runSdkClient() {
    console.log('[SdkClient] Creating StdioClientTransport to run server...');
    // Configura o transporte para INICIAR o processo do servidor
    const transport = new StdioClientTransport({
        command: 'node',           // O comando para executar o Node
        args: ['./build/main.js'], // O caminho para o script do servidor compilado
        // Opcional: adicionar env vars se necessário, como USE_MOCK_BRIDGE
        env: { ...process.env, USE_MOCK_BRIDGE: 'true' }
    });
    console.log('[SdkClient] Transport configured.');
    console.log('[SdkClient] Creating MCP Client...');
    const client = new Client({
        name: "sdk-test-client",
        version: "1.0.0"
    });
    console.log('[SdkClient] MCP Client created.');
    try {
        console.log('[SdkClient] Connecting client to transport (this will start the server)...');
        // Conectar o cliente vai iniciar o processo do servidor definido no transporte
        await client.connect(transport);
        console.log('[SdkClient] Client connected successfully!');
        // Pequena pausa para garantir que o servidor esteja 100% pronto (precaução)
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[SdkClient] Attempting to list tools via SDK client...');
        const tools = await client.listTools();
        console.log('[SdkClient] Available tools listed by server:', JSON.stringify(tools, null, 2));
        // Verifica se a ferramenta 'npc-look-around' foi listada
        const echoToolInfo = tools.tools.find(t => t.name === "get-alerts");
        if (echoToolInfo) {
            console.log("[SdkClient] 'npc-look-around' tool FOUND in the list!");
        } else {
            console.error("[SdkClient] !!!!! 'npc-look-around' tool NOT FOUND in the list returned by server !!!!!");
        }
        console.log('\n[SdkClient] Attempting to call "get-alerts" tool via SDK client...');
        const messageToSend = "RS";
        const result = await client.callTool({
            name: "get-alerts",
            arguments: { state: 'NY' } // Argumento correto
        });
        console.log('[SdkClient] "get-alerts" tool call SUCCESSFUL. Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('\n[SdkClient] !!!!! ERROR during SDK client test !!!!!', error);
    } finally {
         console.log('\n[SdkClient] Closing client connection...');
         // O close no cliente com StdioClientTransport também deve parar o servidor
         await client.close();
         console.log('[SdkClient] Client closed.');
    }
}

runSdkClient();