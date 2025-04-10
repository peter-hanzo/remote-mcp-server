import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "server1",
		version: "1.0.0",
	});

	async init() {
		// Addition
		this.server.tool(
			"sum",
			{
				a: z.number().describe("The first number"),
				b: z.number().describe("The second number"),
			},
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a + b) }],
			}),
			{
				description: "Adds two numbers and returns the result as text.",
			}
		);

		// Multiplication
		this.server.tool(
			"multiply",
			{
				a: z.number().describe("The first number"),
				b: z.number().describe("The second number"),
			},
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a * b) }],
			}),
			{
				description: "Multiplies two numbers and returns the result as text.",
			}
		);

		// Division
		this.server.tool(
			"divide",
			{
				a: z.number().describe("The numerator"),
				b: z.number().describe("The denominator (must not be 0)"),
			},
			async ({ a, b }) => {
				if (b === 0) {
					return {
						content: [{ type: "text", text: "Error: division by zero" }],
					};
				}
				return {
					content: [{ type: "text", text: String(a / b) }],
				};
			},
			{
				description: "Divides the first number by the second. Returns the result as text. Division by zero is not allowed.",
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
