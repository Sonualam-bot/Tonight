// Messages the client sends to the server (intents).
export type ClientMessage = { type: "hello"; playerToken: string };

// Messages the server sends to the client (facts).
export type PairStatus = "waiting_for_partner" | "paired" | "ended";

export type ServerMessage = {
  type: "pair_state";
  status: PairStatus;
  partnerOnline: boolean;
};
