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
		// Сложение
		this.server.tool(
			"sum",
			{
				a: z.number().describe("Первое число"),
				b: z.number().describe("Второе число"),
			},
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a + b) }],
			}),
			{
				description: "Складывает два числа и возвращает сумму как текст.",
			}
		);

		// Умножение
		this.server.tool(
			"multiply",
			{
				a: z.number().describe("Первое число"),
				b: z.number().describe("Второе число"),
			},
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a * b) }],
			}),
			{
				description: "Умножает два числа и возвращает результат как текст.",
			}
		);

		// Деление
		this.server.tool(
			"divide",
			{
				a: z.number().describe("Число-делимое"),
				b: z.number().describe("Число-делитель (не должно быть 0)"),
			},
			async ({ a, b }) => {
				if (b === 0) {
					return {
						content: [{ type: "text", text: "Ошибка: деление на ноль" }],
					};
				}
				return {
					content: [{ type: "text", text: String(a / b) }],
				};
			},
			{
				description: "Делит первое число на второе и возвращает результат. Деление на ноль не допускается.",
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
