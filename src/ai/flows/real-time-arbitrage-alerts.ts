'use server';

/**
 * @fileOverview A real-time arbitrage alert AI agent.
 *
 * - realTimeArbitrageAlerts - A function that determines whether to send an alert for arbitrage opportunities.
 * - RealTimeArbitrageAlertsInput - The input type for the realTimeArbitrageAlerts function.
 * - RealTimeArbitrageAlertsOutput - The return type for the realTimeArbitrageAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeArbitrageAlertsInputSchema = z.object({
  arbitragePath: z.string().describe('The arbitrage path being monitored (e.g., USDT→BTC→USDC→USDT).'),
  potentialProfit: z.number().describe('The potential profit for the arbitrage opportunity.'),
  bidAskPrices: z.string().describe('Current bid and ask prices for each leg of the arbitrage path.'),
});
export type RealTimeArbitrageAlertsInput = z.infer<typeof RealTimeArbitrageAlertsInputSchema>;

const RealTimeArbitrageAlertsOutputSchema = z.object({
  shouldAlert: z.boolean().describe('Whether an alert should be sent for the arbitrage opportunity.'),
  alertMessage: z.string().optional().describe('A message to send with the alert, if shouldAlert is true.'),
});
export type RealTimeArbitrageAlertsOutput = z.infer<typeof RealTimeArbitrageAlertsOutputSchema>;

export async function realTimeArbitrageAlerts(input: RealTimeArbitrageAlertsInput): Promise<RealTimeArbitrageAlertsOutput> {
  return realTimeArbitrageAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeArbitrageAlertsPrompt',
  input: {schema: RealTimeArbitrageAlertsInputSchema},
  output: {schema: RealTimeArbitrageAlertsOutputSchema},
  prompt: `You are an AI assistant that analyzes real-time arbitrage opportunities and determines whether to send an alert based on the potential profit.

Arbitrage Path: {{{arbitragePath}}}
Potential Profit: {{{potentialProfit}}}
Bid/Ask Prices: {{{bidAskPrices}}}

Consider the following factors to determine if an alert should be sent:
- The absolute value of the potential profit.
- The percentage of profit relative to the total investment.
- The risk associated with the arbitrage path.

Respond with JSON. Set shouldAlert to true if the arbitrage opportunity is significant enough to warrant an alert. If shouldAlert is true, provide a concise alertMessage explaining the opportunity.
`,
});

const realTimeArbitrageAlertsFlow = ai.defineFlow(
  {
    name: 'realTimeArbitrageAlertsFlow',
    inputSchema: RealTimeArbitrageAlertsInputSchema,
    outputSchema: RealTimeArbitrageAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
