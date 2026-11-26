/** AT-207 reserves this boundary. Message semantics arrive in a later issue. */
export interface A2uiSource {
  readonly messages: readonly unknown[];
}

export const emptyA2uiSource: A2uiSource = { messages: [] };
