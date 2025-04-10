import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Server1",
		version: "1.0.0",
	});

	async init() {
		this.server.tool(
			"add",
			{
				a: z.number().describe("Первое число для сложения"),
				b: z.number().describe("Второе число для сложения"),
			},
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a + b) }],
			}),
			{
				description: "Складывает два числа и возвращает результат как текст.",
			}
		);
	}
}

// Export the OAuth handler as the default
export default new OAuthProvider({
	apiRoute: "/sse",
	// TODO: fix these types
	// @ts-ignore
	apiHandler: MyMCP.mount("/sse"),
	// @ts-ignore
	defaultHandler: app,
	authorizeEndpoint: "/authorize",
	tokenEndpoint: "/token",
	clientRegistrationEndpoint: "/register",
});
